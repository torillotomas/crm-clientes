# 🚀 CRM de Clientes – Portfolio Project (React + Node + Prisma + SQLite)

Aplicación fullstack para gestionar clientes, notas, actividad comercial, estados avanzados y tablero Kanban con **drag & drop** totalmente funcional.  
Incluye autenticación JWT, UI moderna con Tailwind, dashboard estadístico y persistencia SQLite vía Prisma.

Este proyecto fue desarrollado como parte de un portfolio profesional para demostrar arquitectura fullstack, diseño de UI y buenas prácticas en React + Node.

---

# 📌 Características principales

### 👤 Autenticación
- Registro y login con JWT  
- Middleware de autorización  
- `/auth/login`, `/auth/register`, `/me`

### 🧑‍💼 Gestión de clientes
- Crear, editar y eliminar (soft delete → `status: "INACTIVE"`)  
- Campos: nombre, email, teléfono, dirección, tags, próximo contacto  
- Filtrado, búsqueda y ordenación  
- Owner por usuario (cada usuario ve solo sus clientes)

### 📝 Notas del cliente
- Listar notas por cliente  
- Crear notas: tipo NOTE, CALL, EMAIL o MEETING  
- Incluye autor de la nota  
- Endpoints:  
  - `GET /clients/:id/notes`  
  - `POST /clients/:id/notes`  
  - `DELETE /clients/:id/notes/:noteId`

### 🗂️ Tablero de oportunidades (Kanban)
- Columnas: `NEW`, `FOLLOW_UP`, `CLOSED`, `LOST`  
- Drag & Drop (HTML5 DnD API)  
- Persiste el cambio de estado en el backend vía:
  ```
  PUT /clients/:id
  ```
- UI moderna y responsiva

### 📊 Dashboard
- Total de clientes  
- Clientes para contactar hoy  
- Estado distribuido  
- Gráficos con Recharts  

---

# 🧱 Tecnologías utilizadas

### Frontend
- React 19  
- React Router DOM 7  
- Tailwind CSS  
- Axios  
- React Hot Toast  
- Recharts  
- HTML5 Drag & Drop API  

### Backend
- Node.js  
- Express  
- Prisma ORM v5  
- SQLite (archivo: `dev.db`)  
- JWT (jsonwebtoken)  
- bcryptjs  
- dotenv  
- CORS  

---

# 🗄️ Base de datos (Prisma + SQLite)

`DATABASE_URL="file:./dev.db"`

### Modelos principales

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  clients   Client[]
  notes     ClientNote[]
}

model Client {
  id          Int      @id @default(autoincrement())
  name        String
  email       String?
  phone       String?
  address     String?
  status      String   @default("ACTIVE")
  tags        String   @default("")
  nextContact DateTime?
  owner       User?    @relation(fields: [ownerId], references: [id])
  ownerId     Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  notes       ClientNote[]
}

model ClientNote {
  id        Int      @id @default(autoincrement())
  content   String
  type      String   @default("NOTE")
  client    Client   @relation(fields: [clientId], references: [id])
  clientId  Int
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
  createdAt DateTime @default(now())
}
```

---

# 🌐 API REST – Endpoints principales (Backend)

### Auth
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| POST | `/auth/register` | Crear usuario |
| POST | `/auth/login` | Login y token JWT |
| GET | `/me` | Obtener usuario logueado (requiere token) |

### Clientes
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| POST | `/clients` | Crear cliente |
| GET | `/clients` | Listar clientes del usuario |
| GET | `/clients/:id` | Ver cliente |
| PUT | `/clients/:id` | Editar cliente / actualizar estado (Kanban) |
| DELETE | `/clients/:id` | Desactivar cliente (soft delete) |

### Notas
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| GET | `/clients/:id/notes` | Listar notas |
| POST | `/clients/:id/notes` | Crear nota |
| DELETE | `/clients/:id/notes/:noteId` | Eliminar nota |

---

# ⚙️ Instalación y ejecución

## Backend (Node + Express + Prisma + SQLite)

```bash
cd server
npm install
```

### Configurar `.env`

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="TU_SECRET_AQUI"
```

### Inicializar base

```bash
npm run prisma:migrate
```

### Iniciar backend

```bash
npm run dev
```

Servidor en:
```
http://localhost:5000
```

---

## Frontend (React + Vite + Tailwind)

```bash
cd client
npm install
npm run dev
```

App en:
```
http://localhost:5173
```

---

# 🔁 Flujo del Kanban (Drag & Drop)

Front:
```js
await api.put(`/clients/${id}`, {
  ...client,
  status: newStatus,
});
```

Backend:
```js
app.put("/clients/:id", authMiddleware, async (req, res) => {
  const updated = await prisma.client.update({
    where: { id },
    data: { status },
  });
});
```

Actualiza estado en SQLite vía Prisma.

---

# 🧪 Estado del proyecto

✔️ CRUD completo  
✔️ Autenticación JWT  
✔️ Kanban persistente  
✔️ Dashboard  

---

# 👨‍💻 Autor

**Demian Tomás Torillo**  
Desarrollador Fullstack Jr.  
React · Node · Tailwind · Prisma · SQLite

---

# ⭐ Contribuciones

Issues, PRs y sugerencias son bienvenidos.  
Si te gustó el proyecto, ¡dejá una ⭐!
