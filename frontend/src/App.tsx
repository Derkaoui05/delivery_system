// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import FournisseurDashboard from "./pages/FournisseurDashboard";
import LivreurDashboard from "./pages/LivreurDashboard";

function Protected({ role, children }: { role: string; children: React.ReactNode }) {
  const { auth } = useAuth();
  if (!auth.token || auth.role !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<Protected role="ADMIN"><AdminDashboard /></Protected>} />
          <Route path="/fournisseur" element={<Protected role="FOURNISSEUR"><FournisseurDashboard /></Protected>} />
          <Route path="/livreur" element={<Protected role="LIVREUR"><LivreurDashboard /></Protected>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}