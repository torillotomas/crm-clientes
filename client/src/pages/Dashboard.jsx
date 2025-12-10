// src/pages/Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import api from "../api";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadClients() {
    try {
      setLoading(true);
      const res = await api.get("/clients");
      setClients(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  // --- estadísticas básicas ---
  const stats = useMemo(() => {
    const total = clients.length;
    const withEmail = clients.filter((c) => c.email).length;
    const withPhone = clients.filter((c) => c.phone).length;

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const thisMonth = clients.filter((c) => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;

    return {
      total,
      withEmail,
      withPhone,
      thisMonth,
    };
  }, [clients]);

  // --- datos para gráfico: altas por mes (últimos 6 meses) ---
  const chartData = useMemo(() => {
    if (!clients.length) return [];

    const now = new Date();
    const months = [];

    // últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("es-AR", {
          month: "short",
          year: "2-digit",
        }),
        count: 0,
      });
    }

    clients.forEach((c) => {
      if (!c.createdAt) return;
      const d = new Date(c.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = months.findIndex((m) => m.key === key);
      if (idx !== -1) {
        months[idx].count += 1;
      }
    });

    return months.map(({ key, ...rest }) => rest);
  }, [clients]);

  return (
    <Layout>
      {/* Título */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Resumen general de tus clientes y actividad reciente.
          </p>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Clientes totales"
          value={stats.total}
          subtitle="Registrados en el sistema"
        />
        <StatCard
          label="Altas este mes"
          value={stats.thisMonth}
          subtitle="Nuevos clientes en el mes actual"
        />
        <StatCard
          label="Con email"
          value={stats.withEmail}
          subtitle="Contactables por correo"
        />
        <StatCard
          label="Con teléfono"
          value={stats.withPhone}
          subtitle="Contactables por teléfono"
        />
      </div>

      {/* Gráfico */}
      <div className="bg-[#0b1220] rounded-xl border border-white/10 p-4 shadow-[0_18px_45px_rgba(15,23,42,.9)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Altas de clientes (últimos 6 meses)
            </h2>
            <p className="text-xs text-slate-400">
              Basado en la fecha de creación de cada cliente.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center text-sm text-slate-400">
            Cargando datos...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-slate-400">
            Todavía no hay datos suficientes para mostrar el gráfico.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={{ stroke: "#1f2937" }}
                  tickLine={{ stroke: "#1f2937" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={{ stroke: "#1f2937" }}
                  tickLine={{ stroke: "#1f2937" }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    borderColor: "#1f2937",
                    backgroundColor: "#020617",
                    color: "#e5e7eb",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorClients)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="bg-[#0b1220] rounded-xl border border-white/10 p-4 flex flex-col justify-between shadow-[0_18px_45px_rgba(15,23,42,.9)]">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-2xl font-semibold text-slate-50 mb-1">
        {value}
      </div>
      <div className="text-[11px] text-slate-500">{subtitle}</div>
    </div>
  );
}
