// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import RegisterFournisseurModal from "../components/RegisterFournisseurModal";

export default function Login() {
  const [email, setEmail] = useState("admin@livraison.com");
  const [password, setPassword] = useState("Admin1234!");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
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
    { label: "Admin", email: "admin@livraison.com", defaultPass: "Admin1234!", color: "#6366f1" },
    { label: "Fournisseur", email: "fournisseur@livraison.com", defaultPass: "Fournisseur1234!", color: "#10b981" },
    { label: "Livreur", email: "livreur@livraison.com", defaultPass: "Livreur1234!", color: "#f59e0b" },
  ];

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.defaultPass);
  };

  return (
    <div className="login-page">
      {/* Background glows */}
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-card" style={{ maxWidth: 440, width: "100%" }}>
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🚚</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
              DeliverPro
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Plateforme moderne de gestion logistique</div>
          </div>
        </div>

        <div className="login-title">Connexion</div>
        <div className="login-subtitle">Accédez à votre espace sécurisé</div>

        {info && (
          <div className="alert alert-success" style={{ marginBottom: 14 }}>
            <span>✓</span> {info}
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 14 }}>
            <span>⚠</span> {error}
          </div>
        )}

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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Mot de passe</label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--brand-500)",
                  fontSize: 12,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ marginTop: 6 }}
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: 6 }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : "Se connecter →"}
          </button>
        </form>

        {/* Inscription Fournisseur */}
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
          Vous êtes expéditeur / fournisseur ?{" "}
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--emerald)",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Créer un compte
          </button>
        </div>

        {/* Demo accounts shortcut */}
        <div className="divider" style={{ margin: "20px 0 14px" }} />
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, textAlign: "center" }}>
          Connexion rapide (comptes démo)
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {demoAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ flex: 1, fontSize: 11, borderColor: acc.color + "40", color: acc.color }}
              onClick={() => handleSelectDemo(acc)}
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      {showRegister && (
        <RegisterFournisseurModal
          onClose={() => setShowRegister(false)}
          onSuccess={(regEmail) => {
            setShowRegister(false);
            setEmail(regEmail);
            setPassword("");
            setInfo("Compte fournisseur créé avec succès ! Veuillez vous connecter.");
          }}
        />
      )}
    </div>
  );
}