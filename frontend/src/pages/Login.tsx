// src/pages/Login.tsx
import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("admin@livraison.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(email, password);
      login(res.token, res.role);
      navigate(`/${res.role.toLowerCase()}`);
    } catch (err: any) {
      setError(err.message || "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: "Admin", email: "admin@livraison.com", color: "#6366f1" },
    { label: "Fournisseur", email: "fournisseur@livraison.com", color: "#10b981" },
    { label: "Livreur", email: "livreur@livraison.com", color: "#f59e0b" },
  ];

  return (
    <div className="login-page">
      {/* Background glows */}
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🚚</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
              DeliverPro
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Système de livraison</div>
          </div>
        </div>

        <div className="login-title">Connexion</div>
        <div className="login-subtitle">Accédez à votre espace de gestion</div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Adresse e-mail</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠</span> {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : "Se connecter →"}
          </button>
        </form>

        {/* Demo accounts shortcut */}
        <div className="divider" style={{ margin: "20px 0 14px" }} />
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, textAlign: "center" }}>
          Comptes de démonstration
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {demoAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ flex: 1, fontSize: 11, borderColor: acc.color + "40", color: acc.color }}
              onClick={() => setEmail(acc.email)}
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}