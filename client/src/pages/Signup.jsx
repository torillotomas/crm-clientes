import { useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/signup", form);
      toast.success("Cuenta creada!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error al crear cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 mb-2">Crear cuenta</h1>
        <p className="text-sm text-slate-500 mb-4">
          Registrate para empezar a usar el CRM.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-slate-600 mb-1 block">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 mb-1 block">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 mb-1 block">Contraseña</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-2 rounded-md text-sm font-medium hover:bg-sky-700 disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <div className="mt-4 text-xs text-center text-slate-500">
          ¿Ya tenés una cuenta?{" "}
          <Link to="/login" className="text-sky-600 font-medium">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
