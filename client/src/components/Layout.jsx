import { useNavigate, NavLink, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isKanban = location.pathname === "/kanban";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="min-h-screen bg-[#0e1525] flex flex-col text-slate-200">
      {/* Topbar */}
      <header className="h-14 px-4 bg-[#0c1320]/70 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-sky-500/90 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-sky-500/40">
            CRM
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-slate-100 text-sm">
              CRM de Clientes
            </span>
            <span className="text-[11px] text-slate-400">
              Proyecto portfolio · React + Node + Prisma
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-sky-500/20 text-sky-200 text-xs font-semibold flex items-center justify-center">
                {user.name?.[0] || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-100">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  {user.email}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-white/15 text-slate-200 bg-white/5 hover:bg-white/10 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Tabs de navegación */}
      <div className="h-9 bg-[#0c1320]/70 backdrop-blur-xl border-b border-white/10 flex items-center px-6 text-xs text-slate-400 gap-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-md transition ${isActive
              ? "bg-sky-500/20 text-sky-200 font-medium border border-sky-500/40"
              : "hover:bg-white/5 border border-transparent"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/clients"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-md transition ${isActive
              ? "bg-sky-500/20 text-sky-200 font-medium border border-sky-500/40"
              : "hover:bg-white/5 border border-transparent"
            }`
          }
        >
          Clientes
        </NavLink>

        <NavLink
          to="/tablero"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-md transition ${isActive
              ? "bg-sky-500/20 text-sky-200 font-medium border border-sky-500/40"
              : "hover:bg-white/5 border border-transparent"
            }`
          }
        >
          Tablero
        </NavLink>
      </div>

      {/* Contenido */}
      <main
        className={
          isKanban
            ? "flex-1 px-6 py-5 w-full overflow-x-hidden"
            : "flex-1 px-6 py-5 max-w-6xl w-full mx-auto overflow-x-hidden"
        }
      >
        {children}
      </main>

      <footer className="h-10 flex items-center justify-center text-[11px] text-slate-500">
        Hecho por Demian · Proyecto de portfolio · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
