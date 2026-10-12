// src/components/ForgotPasswordModal.tsx
import { useState } from "react";
import { api } from "../api";

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [autoToken, setAutoToken] = useState<string | null>(null);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setSuccess("Un jeton de réinitialisation a été généré.");
      if (res.resetToken) {
        setAutoToken(res.resetToken);
        setToken(res.resetToken);
      }
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la demande de réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({ token, newPassword });
      setSuccess("Votre mot de passe a été réinitialisé ! Vous pouvez maintenant vous connecter.");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Jeton invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 460, width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔑</span>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              {step === "request" ? "Mot de passe oublié" : "Réinitialisation du mot de passe"}
            </h3>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div className="alert alert-error" style={{ fontSize: 13, padding: "8px 12px" }}>
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ fontSize: 13, padding: "8px 12px" }}>
              <span>✓</span> {success}
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequestToken} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                Entrez votre adresse email. Un jeton de réinitialisation vous sera attribué pour renouveler votre mot de passe.
              </p>

              <div className="form-group">
                <label className="form-label">Adresse e-mail</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep("reset")}
                  style={{ fontSize: 12 }}
                >
                  J'ai déjà un jeton
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Envoi..." : "Suivant"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {autoToken && (
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  <strong style={{ color: "var(--brand-500)" }}>Jeton détecté:</strong> {autoToken.substring(0, 16)}...
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Jeton de réinitialisation</label>
                <input
                  type="text"
                  className="form-input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="UUID du jeton"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nouveau mot de passe (min. 8 car.)</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep("request")}
                  style={{ fontSize: 12 }}
                >
                  ← Retour
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Réinitialisation..." : "Valider"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
