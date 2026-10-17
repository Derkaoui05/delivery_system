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
  Shield,
  Building2,
  Bike,
} from "lucide-react";
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
    { label: "Admin", email: "admin@livraison.com", defaultPass: "Admin1234!", color: "var(--brand-400)", icon: Shield },
    { label: "Fournisseur", email: "fournisseur@livraison.com", defaultPass: "Fournisseur1234!", color: "var(--emerald-400)", icon: Building2 },
    { label: "Livreur", email: "livreur@livraison.com", defaultPass: "Livreur1234!", color: "var(--amber-400)", icon: Bike },
  ];

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.defaultPass);
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

        {/* Demo shortcuts */}
        <div className="divider" style={{ margin: "22px 0 16px" }} />
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12, textAlign: "center", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Accès rapide de démonstration
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            return (
              <button
                key={acc.email}
                type="button"
                className="btn btn-ghost btn-sm"
                style={{
                  fontSize: 11.5,
                  padding: "7px 6px",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                  gap: 6,
                }}
                onClick={() => handleSelectDemo(acc)}
              >
                <Icon size={13} strokeWidth={2} style={{ color: acc.color }} />
                <span>{acc.label}</span>
              </button>
            );
          })}
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