// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import RegisterFournisseurModal from "../components/RegisterFournisseurModal";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="login-page">
      {/* Ambient background glows */}
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-card">
        {/* Brand identity */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Truck size={26} strokeWidth={2.2} />
          </div>
          <h1 className="login-title">SwiftLog</h1>
          <p className="login-subtitle">Plateforme entreprise de gestion logistique</p>
        </div>

        {info && (
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            <CheckCircle2 size={16} strokeWidth={2.2} />
            <span>{info}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <AlertCircle size={16} strokeWidth={2.2} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Mail size={13} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
              <span>Adresse e-mail professionnelle</span>
            </label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="votre@entreprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label" htmlFor="login-password" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 0 }}>
                <Lock size={13} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
                <span>Mot de passe</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--brand-400)",
                  fontSize: 12,
                  fontWeight: 600,
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
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: 4, height: 44 }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <span>Accéder au portail</span>
                <ArrowRight size={16} strokeWidth={2.2} />
              </>
            )}
          </button>
        </form>

        {/* Fournisseur account creation prompt */}
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
          Vous êtes expéditeur / fournisseur ?{" "}
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--emerald-400)",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Créer un compte
          </button>
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
            setInfo("Compte fournisseur créé avec succès ! Vous pouvez maintenant vous connecter.");
          }}
        />
      )}
    </div>
  );
}
