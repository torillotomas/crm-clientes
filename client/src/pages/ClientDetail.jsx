// src/pages/ClientDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    type: "NOTE",
    content: "",
  });

  async function load() {
    try {
      setLoading(true);
      const resClient = await api.get(`/clients/${id}`);
      const resNotes = await api.get(`/clients/${id}/notes`);
      setClient(resClient.data);
      setNotes(resNotes.data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar datos del cliente");
      navigate("/clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddNote(e) {
    e.preventDefault();

    if (!form.content.trim()) {
      toast.error("La nota no puede estar vacía");
      return;
    }

    try {
      const res = await api.post(`/clients/${id}/notes`, form);
      setNotes((prev) => [res.data, ...prev]);
      setForm({ type: "NOTE", content: "" });
      toast.success("Nota agregada");
    } catch (err) {
      console.error(err);
      toast.error("Error al agregar nota");
    }
  }

  if (loading || !client) {
    return (
      <Layout>
        <div className="text-slate-400">Cargando cliente...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Volver */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/clients")}
          className="text-sm text-sky-400 hover:underline"
        >
          ← Volver a clientes
        </button>
      </div>

      {/* TARJETA PRINCIPAL (igual estilo que las demás) */}
      <div className="bg-[#0b1220] border border-white/10 rounded-xl shadow-[0_18px_45px_rgba(15,23,42,.9)] p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {client.name}
            </h1>
            <p className="text-sm text-slate-400">
              Cliente creado el{" "}
              {new Date(client.createdAt).toLocaleDateString("es-AR")}
            </p>
          </div>

          <div className="text-sm text-slate-300 space-y-1">
            <p>
              <span className="text-slate-400">Email:</span>{" "}
              {client.email || "-"}
            </p>
            <p>
              <span className="text-slate-400">Teléfono:</span>{" "}
              {client.phone || "-"}
            </p>
            <p>
              <span className="text-slate-400">Dirección:</span>{" "}
              {client.address || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* COLUMNAS: formulario + actividad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AGREGAR NOTA */}
        <div className="bg-[#0b1220] border border-white/10 rounded-xl shadow-[0_18px_45px_rgba(15,23,42,.9)] p-5">
          <h2 className="text-slate-200 font-semibold mb-4">
            Agregar nota / actividad
          </h2>

          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tipo</label>
              <select
                name="type"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
                className="w-full px-2 py-2 rounded-md bg-slate-900/60 border border-slate-700/70 text-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="NOTE">Nota</option>
                <option value="CALL">Llamada</option>
                <option value="EMAIL">Email</option>
                <option value="MEETING">Reunión</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Detalle
              </label>
              <textarea
                name="content"
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                className="w-full h-32 px-3 py-2 rounded-md bg-slate-900/60 border border-slate-700/70 text-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Ej: Llamada con el cliente, pidió presupuesto..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 transition text-white text-sm font-medium py-2 rounded-md"
            >
              Agregar nota
            </button>
          </form>
        </div>

        {/* LISTA DE NOTAS */}
        <div className="bg-[#0b1220] border border-white/10 rounded-xl shadow-[0_18px_45px_rgba(15,23,42,.9)] p-5">
          <h2 className="text-slate-200 font-semibold mb-4">
            Actividad reciente
          </h2>

          {notes.length === 0 ? (
            <p className="text-slate-400 text-sm">
              Todavía no hay notas para este cliente.
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/70"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
                      {n.type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 mt-2">{n.content}</p>

                  <p className="text-xs text-slate-500 mt-2">
                    {n.author?.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
