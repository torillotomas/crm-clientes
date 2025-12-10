const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

// ---------- Middlewares ----------
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ---------- Helper: generar token ----------
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ---------- Middleware proteger rutas ----------
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("Error token:", err);
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ---------- Ruta de prueba ----------
app.get("/health", async (req, res) => {
  const count = await prisma.user.count();
  res.json({ ok: true, users: count });
});

// ---------- Registro ----------
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "El email ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error("Error register:", err);
    res.status(500).json({ error: "Error interno en registro" });
  }
});

// ---------- Login ----------
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(400).json({ error: "Credenciales inválidas" });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(400).json({ error: "Credenciales inválidas" });

    const token = generateToken(user);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error("Error login:", err);
    res.status(500).json({ error: "Error interno en login" });
  }
});

// ---------- Obtener usuario logueado ----------
app.get("/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  res.json({ user });
});

app.post("/clients", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, address, tags, status, nextContact } = req.body;




    if (!name) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
        tags: tags || "",
        status: status || "NEW",
        nextContact: nextContact ? new Date(nextContact) : null, // 👈
        ownerId: req.userId,
      },
    });

    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear cliente" });
  }
});


app.get("/clients", authMiddleware, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: {
        ownerId: req.userId,
        status: { not: "INACTIVE" }, 
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(clients);
  } catch (err) {
    console.error("Error GET /clients:", err);
    res.status(500).json({ error: "Error obteniendo clientes" });
  }
});


app.get("/clients/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const client = await prisma.client.findFirst({
      where: {
        id,
        ownerId: req.userId,
      },
    });

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(client);
  } catch (err) {
    console.error("Error GET /clients/:id:", err);
    res.status(500).json({ error: "Error obteniendo cliente" });
  }
});

app.put("/clients/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, phone, address, tags, status } = req.body;

    const client = await prisma.client.findFirst({
      where: { id, ownerId: req.userId },
    });

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        tags: tags || "",
        status: status || client.status,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

app.delete("/clients/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.client.findFirst({
      where: { id, ownerId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const deleted = await prisma.client.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    res.json({ message: "Cliente desactivado", deleted });
  } catch (err) {
    console.error("Error DELETE /clients/:id:", err);
    res.status(500).json({ error: "Error eliminando cliente" });
  }
});

// === SIGNUP ===
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // revisar si ya existe
    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // hash de password
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "USER",
      },
    });

    // token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Error en signup:", err);
    return res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// === NOTAS DE CLIENTE ===

// Listar notas de un cliente
app.get("/clients/:id/notes", authMiddleware, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);

    // chequeo que el cliente sea del usuario
    const client = await prisma.client.findFirst({
      where: { id: clientId, ownerId: req.userId },
    });

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const notes = await prisma.clientNote.findMany({
      where: { clientId },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(notes);
  } catch (err) {
    console.error("Error GET /clients/:id/notes:", err);
    res.status(500).json({ error: "Error al obtener notas" });
  }
});

// Crear nota para un cliente
app.post("/clients/:id/notes", authMiddleware, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const { content, type } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "El contenido es obligatorio" });
    }

    // chequeo que el cliente sea del usuario
    const client = await prisma.client.findFirst({
      where: { id: clientId, ownerId: req.userId },
    });

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const note = await prisma.clientNote.create({
      data: {
        content: content.trim(),
        type: type || "NOTE",
        clientId,
        authorId: req.userId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("Error POST /clients/:id/notes:", err);
    res.status(500).json({ error: "Error al crear nota" });
  }
});

// (Opcional) Eliminar nota
app.delete(
  "/clients/:id/notes/:noteId",
  authMiddleware,
  async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const noteId = parseInt(req.params.noteId);

      const note = await prisma.clientNote.findUnique({
        where: { id: noteId },
        include: { client: true },
      });

      if (!note || note.clientId !== clientId || note.client.ownerId !== req.userId) {
        return res.status(404).json({ error: "Nota no encontrada" });
      }

      await prisma.clientNote.delete({ where: { id: noteId } });

      res.json({ message: "Nota eliminada" });
    } catch (err) {
      console.error("Error DELETE /clients/:id/notes/:noteId:", err);
      res.status(500).json({ error: "Error al eliminar nota" });
    }
  }
);




// ---------- Levantar servidor ----------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
