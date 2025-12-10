import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Clients from "./pages/Clients.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Signup from "./pages/Signup.jsx";
import ClientDetail from "./pages/ClientDetail.jsx";
import Tablero from "./pages/Tablero.jsx";


function getToken() {
  return localStorage.getItem("token");
}

function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />

      <Route path="/signup" element={<Signup />} />

      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <ClientDetail />
          </ProtectedRoute>
        }
      />

      {/* raíz → dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/tablero"
        element={
          <ProtectedRoute>
            <Tablero/>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
