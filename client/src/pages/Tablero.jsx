// src/pages/Tablero.jsx o Kanban.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api";

export default function Kanban() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // cuál tarjeta se está arrastrando
  const [draggedId, setDraggedId] = useState(null);

  // cargar clientes del backend
  useEffect(() => {
    let mounted = true;

    async function loadClients() {
      try {
        setLoading(true);
        const res = await api.get("/clients");
        if (mounted) setClients(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadClients();
    return () => {
      mounted = false;
    };
  }, []);

  const columns = useMemo(
    () => [
      { id: "NEW", title: "Nuevos", color: "from-sky-500 to-emerald-400" },
      {
        id: "FOLLOW_UP",
        title: "En seguimiento",
        color: "from-sky-400 to-cyan-400",
      },
      { id: "CLOSED", title: "Cerrados", color: "from-indigo-400 to-sky-400" },
      { id: "LOST", title: "Perdidos", color: "from-rose-500 to-orange-400" },
    ],
    []
  );

  const grouped = useMemo(() => {
    const map = { NEW: [], FOLLOW_UP: [], CLOSED: [], LOST: [] };
    for (const c of clients) {
      const status = c.status || "FOLLOW_UP";
      if (!map[status]) map[status] = [];
      map[status].push(c);
    }
    return map;
  }, [clients]);

  const todayToCall = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return clients.filter((c) => {
      if (!c.nextContact) return false;
      const d = new Date(c.nextContact);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length;
  }, [clients]);

  // ---------- Drag & Drop handlers ----------

  const handleDragStart = (e, clientId) => {
    setDraggedId(clientId);
    // por las dudas
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleDragOver = (e) => {
    // necesario para permitir el drop
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

const handleDrop = async (e, newStatus) => {
  e.preventDefault();
  if (!draggedId) return;

  const id = draggedId;

  // 1) actualizar en el front
  setClients((prev) =>
    prev.map((c) =>
      c.id === id
        ? {
            ...c,
            status: newStatus,
          }
        : c
    )
  );
  setDraggedId(null);

  // 2) actualizar en el backend usando el mismo esquema que en Clients.jsx
  try {
    const client = clients.find((c) => c.id === id);
    if (!client) return;

    // armamos el payload igual que editForm en Clients.jsx
    const payload = {
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      tags: client.tags || "",
      status: newStatus,
      nextContact: client.nextContact
        ? client.nextContact.slice(0, 10) // yyyy-mm-dd
        : "",
    };

    await api.put(`/clients/${id}`, payload);
  } catch (err) {
    console.error("Error actualizando estado en backend", err);
    // si querés, acá podrías hacer rollback del estado en memoria
  }
};


  return (
    <Layout>
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Tablero de oportunidades
            </h1>
            <p className="text-sm text-slate-400">
              Arrastrá los clientes entre columnas para actualizar su estado.
            </p>
          </div>

          <div className="flex gap-3 text-xs">
            <StatCard
              label="Total clientes"
              value={clients.length}
              bg="bg-white/5"
              border="border-white/15"
            />
            <StatCard
              label="En seguimiento"
              value={grouped.FOLLOW_UP.length}
              bg="bg-sky-500/10"
              border="border-sky-500/40"
            />
            <StatCard
              label="Contactar hoy"
              value={todayToCall}
              bg="bg-amber-500/10"
              border="border-amber-500/40"
            />
          </div>
        </div>

        {/* Columnas */}
        <div className="mt-4 w-full">
          <div className="flex gap-4 w-full">
            {columns.map((col) => {
              const list = grouped[col.id] || [];

              return (
                <div key={col.id} className="flex-1 min-w-0">
                  {/* cabecera columna */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                      <span className="text-sm font-medium text-slate-50">
                        {col.title}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {list.length}
                    </span>
                  </div>

                  {/* barra de color */}
                  <div className="h-1 rounded-full bg-slate-800 overflow-hidden mb-3">
                    <div
                      className={`h-full w-full bg-gradient-to-r ${col.color}`}
                    />
                  </div>

                  {/* zona droppable */}
                  <div
                    className={`bg-[#101827] rounded-2xl border border-white/10 p-3 min-h-[140px] transition-colors ${
                      // highlight suave cuando algo se arrastra
                      draggedId ? "border-dashed border-sky-500/40" : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                  >
                    {loading ? (
                      <p className="text-xs text-slate-500">Cargando...</p>
                    ) : list.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        Sin clientes en esta columna.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {list.map((c) => (
                          <div
                            key={c.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, c.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => navigate(`/clients/${c.id}`)}
                            className="cursor-grab active:cursor-grabbing w-full text-left bg-[#0d1626]/80 border border-white/10 hover:border-sky-500/60 hover:bg-[#131c30] rounded-2xl px-4 py-3 transition shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-1 gap-2">
                              <span className="text-sm font-semibold text-slate-50 truncate">
                                {c.name}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate">
                                {c.email || c.phone || "Sin contacto principal"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              {c.phone && <span>{c.phone}</span>}
                            </div>

                            {/* tags */}
                            {c.tags && c.tags.trim() !== "" && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {c.tags
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean)
                                  .map((tag, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-200 border border-sky-500/40"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, bg, border }) {
  return (
    <div
      className={`px-4 py-2 rounded-2xl ${bg} border ${border} flex flex-col justify-center min-w-[110px]`}
    >
      <span className="text-[10px] uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-50">{value}</span>
    </div>
  );
}
