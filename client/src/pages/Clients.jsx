// src/pages/Clients.jsx
import { useEffect, useState, useMemo } from "react";
import api from "../api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    tags: "",
    status: "NEW",
    nextContact: "",
  });

  // estado para edición
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    tags: "",
    status: "NEW",
    nextContact: "",
  });

  // --------- cargar clientes ---------
  async function loadClients() {
    try {
      setLoading(true);
      const res = await api.get("/clients");
      setClients(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  // --------- búsqueda + filtro ---------
  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();

    return clients.filter((c) => {
      const text = `${c.name || ""} ${c.email || ""} ${c.phone || ""}`.toLowerCase();
      const matchesText = !q || text.includes(q);

      const matchesStatus =
        statusFilter === "ALL" ||
        (c.status || "FOLLOW_UP") === statusFilter ||
        (statusFilter === "FOLLOW_UP" && c.status === "ACTIVE");

      return matchesText && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  // --------- alta ---------
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name) {
      toast.error("El nombre es obligatorio");
      return;
    }

    try {
      setSaving(true);
      const res = await api.post("/clients", form);
      toast.success("Cliente creado");
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        tags: "",
        status: "NEW",
        nextContact: "",
      });
      setClients((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error(err);
      toast.error("Error al crear cliente");
    } finally {
      setSaving(false);
    }
  }

  // --------- eliminar (baja lógica) ---------
  async function handleDelete(id) {
    if (!confirm("¿Seguro que querés desactivar este cliente?")) return;

    try {
      await api.delete(`/clients/${id}`);
      toast.success("Cliente desactivado");
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar cliente");
    }
  }

  // --------- edición ---------
  function openEdit(client) {
    setEditing(client);
    setEditForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      tags: client.tags || "",
      status: client.status || "NEW",
      nextContact: client.nextContact
        ? client.nextContact.slice(0, 10) // yyyy-mm-dd
        : "",
    });
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editing) return;

    try {
      setSaving(true);
      const res = await api.put(`/clients/${editing.id}`, editForm);

      toast.success("Cliente actualizado");

      setClients((prev) =>
        prev.map((c) => (c.id === editing.id ? res.data : c))
      );

      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar cliente");
    } finally {
      setSaving(false);
    }
  }

  function closeEdit() {
    if (saving) return;
    setEditing(null);
  }

  // --------- helpers ---------
  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("es-AR");
  }

  // colores para el estado
  const statusStyles = {
    NEW: {
      label: "Nuevo",
      classes: "bg-emerald-500/10 text-emerald-200 border-emerald-400/40",
    },
    FOLLOW_UP: {
      label: "En seguimiento",
      classes: "bg-sky-500/10 text-sky-200 border-sky-400/40",
    },
    CLOSED: {
      label: "Cerrado",
      classes: "bg-slate-500/10 text-slate-200 border-slate-400/40",
    },
    LOST: {
      label: "Perdido",
      classes: "bg-red-500/10 text-red-200 border-red-400/40",
    },
    ACTIVE: {
      label: "En seguimiento",
      classes: "bg-sky-500/10 text-sky-200 border-sky-400/40",
    },
  };

  return (
    <Layout>
      {/* Header de página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Clientes</h1>
          <p className="text-sm text-slate-400">
            Alta rápida, búsqueda y administración de tus clientes.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="px-2 py-1 rounded-full bg-sky-500/10 border border-sky-500/40 text-sky-200">
            Activos:{" "}
            <span className="font-semibold text-sky-100">
              {clients.length}
            </span>
          </span>
        </div>
      </div>

      {/* Formulario de alta */}
      <div className="bg-[#0b1220] border border-white/10 rounded-xl shadow-[0_18px_45px_rgba(15,23,42,.9)] p-4 mb-6">
        <h2 className="text-sm font-semibold text-slate-100 mb-3">
          Nuevo cliente
        </h2>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
        >
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-300 mb-1">Nombre *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-300 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
              placeholder="correo@cliente.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-300 mb-1">
              Teléfono
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
              placeholder="11 2345 6789"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-300 mb-1">
              Dirección
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
              placeholder="CABA, Argentina"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-300 mb-1">
              Etiquetas (separadas por coma)
            </label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
              placeholder="vip, recurrente, lead frío"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Estado</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
            >
              <option value="NEW">Nuevo</option>
              <option value="FOLLOW_UP">En seguimiento</option>
              <option value="CLOSED">Cerrado</option>
              <option value="LOST">Perdido</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Próximo contacto
            </label>
            <input
              type="date"
              name="nextContact"
              value={form.nextContact}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
            />
          </div>

          <div className="md:col-span-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 disabled:opacity-60 shadow-md shadow-sky-500/30 transition"
            >
              {saving ? "Guardando..." : "Agregar cliente"}
            </button>
          </div>
        </form>
      </div>

      {/* Barra de búsqueda + listado */}
      <div className="bg-[#0b1220] border border-white/10 rounded-xl shadow-[0_18px_45px_rgba(15,23,42,.9)] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm font-semibold text-slate-100">
            Listado de clientes
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 px-3 py-2 rounded-md border border-slate-700/70 bg-slate-900/60 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
              placeholder="Buscar por nombre, email o teléfono..."
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-slate-700/70 bg-slate-900/60 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
            >
              <option value="ALL">Todos</option>
              <option value="NEW">Nuevo</option>
              <option value="FOLLOW_UP">En seguimiento</option>
              <option value="CLOSED">Cerrado</option>
              <option value="LOST">Perdido</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-slate-400">Cargando...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-4 text-sm text-slate-400">
            No se encontraron clientes con ese criterio.
          </div>
        ) : (
          <div className="overflow-x-auto w-full hide-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/70 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-slate-300">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-300 break-words">
                    Email
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-300">
                    Teléfono
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-300 break-words">
                    Dirección
                  </th>
                  {/* Ojo: ahora los encabezados siguen el mismo orden que las celdas */}
                  <th className="text-left px-4 py-2 font-semibold text-slate-300">
                    Etiquetas
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-300">
                    Próximo contacto
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-300">
                    Estado
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-300">
                    Creado
                  </th>
                  <th className="text-right px-4 py-2 font-semibold text-slate-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={`border-b border-slate-800/80 ${idx % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/20"
                      } hover:bg-sky-900/20 transition`}
                  >
                    <td className="px-4 py-2 text-slate-100">{c.name}</td>
                    <td className="px-4 py-2 text-slate-300">
                      {c.email || "-"}
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      {c.phone || "-"}
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      {c.address || "-"}
                    </td>

                    {/* Etiquetas */}
                    <td className="px-4 py-2">
                      {(() => {
                        const tagsArray = (c.tags || "")
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean);

                        if (tagsArray.length === 0) {
                          return (
                            <span className="text-slate-500 text-xs">
                              Sin tags
                            </span>
                          );
                        }

                        return (
                          <div className="flex gap-1 flex-wrap">
                            {tagsArray.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full text-xs bg-sky-500/10 text-sky-200 border border-sky-400/40"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Próximo contacto */}
                    <td className="px-4 py-2">
                      {(() => {
                        if (!c.nextContact) {
                          return (
                            <span className="text-slate-500 text-xs">
                              Sin fecha
                            </span>
                          );
                        }

                        const d = new Date(c.nextContact);
                        if (isNaN(d.getTime())) {
                          return (
                            <span className="text-slate-500 text-xs">
                              Sin fecha
                            </span>
                          );
                        }

                        const hoy = new Date();
                        hoy.setHours(0, 0, 0, 0);
                        const fecha = new Date(d);
                        fecha.setHours(0, 0, 0, 0);

                        const vencido = fecha < hoy;

                        const baseClasses =
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border whitespace-nowrap ";

                        if (vencido) {
                          return (
                            <span
                              className={
                                baseClasses +
                                "bg-red-500/10 text-red-200 border-red-400/40"
                              }
                            >
                              Vencido ·{" "}
                              {fecha.toLocaleDateString("es-AR")}
                            </span>
                          );
                        }

                        return (
                          <span
                            className={
                              baseClasses +
                              "bg-amber-500/10 text-amber-200 border-amber-400/40"
                            }
                          >
                            {fecha.toLocaleDateString("es-AR")}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-2">
                      {(() => {
                        const status = c.status || "FOLLOW_UP";
                        const cfg =
                          statusStyles[status] || statusStyles.FOLLOW_UP;

                        return (
                          <span
                            className={
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border whitespace-nowrap " +
                              cfg.classes
                            }
                          >
                            {cfg.label}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Creado */}
                    <td className="px-4 py-2 text-slate-400">
                      {formatDate(c.createdAt)}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/clients/${c.id}`)}
                          className="text-xs px-3 py-1.5 rounded-md border border-slate-600 text-slate-100 hover:bg-slate-800/60"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="text-xs px-3 py-1.5 rounded-md border border-sky-500/50 text-sky-100 hover:bg-sky-900/40"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-xs px-3 py-1.5 rounded-md border border-red-500/60 text-red-100 hover:bg-red-900/40"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL de edición */}
      {editing && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#020617] w-full max-w-lg rounded-xl shadow-[0_18px_45px_rgba(0,0,0,.75)] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-100">
                Editar cliente
              </h3>
              <button
                onClick={closeEdit}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Nombre *
                </label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Dirección
                </label>
                <input
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
                  >
                    <option value="NEW">Nuevo</option>
                    <option value="FOLLOW_UP">En seguimiento</option>
                    <option value="CLOSED">Cerrado</option>
                    <option value="LOST">Perdido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Próximo contacto
                  </label>
                  <input
                    type="date"
                    name="nextContact"
                    value={editForm.nextContact}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  name="tags"
                  value={editForm.tags}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 rounded-md text-sm bg-slate-900/60 border border-slate-700/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-3 py-1.5 rounded-md border border-slate-600 text-xs text-slate-200 hover:bg-slate-800/60"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-md bg-sky-600 text-white text-xs font-medium hover:bg-sky-500 disabled:opacity-60 shadow-md shadow-sky-500/30"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
