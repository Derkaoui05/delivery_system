// src/components/ForgotPasswordModal.tsx
import { useState } from "react";
import { KeyRound, X, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Mail } from "lucide-react";
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
      setSuccess("Un jeton de réinitialisation a été généré avec succès.");
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
      setError(err.message || "Jeton de réinitialisation invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 460, width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-sm)",
                background: "var(--brand-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--brand-400)",
              }}
            >
              <KeyRound size={18} strokeWidth={2} />
            </div>
            <h3 className="modal-title">
              {step === "request" ? "Mot de passe oublié" : "Réinitialisation du mot de passe"}
            </h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fermer">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={15} strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={15} strokeWidth={2} />
              <span>{success}</span>
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequestToken} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Renseignez votre adresse e-mail. Un jeton sécurisé de renouvellement vous sera généré pour configurer votre nouveau mot de passe.
              </p>

              <div className="form-group">
                <label className="form-label">Adresse e-mail</label>
                <div className="search-wrapper">
                  <div className="search-icon">
                    <Mail size={14} strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    className="form-input search-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@entreprise.com"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStep("reset")}
                  style={{ fontSize: 12.5 }}
                >
                  J'ai déjà un jeton
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={onClose}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: 6 }}>
                    {loading ? (
                      <>
                        <span className="spinner" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <span>Suivant</span>
                        <ArrowRight size={14} strokeWidth={2} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {autoToken && (
                <div
                  style={{
                    background: "var(--brand-surface)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 12px",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  <strong style={{ color: "var(--brand-400)" }}>Jeton détecté :</strong> {autoToken.substring(0, 16)}...
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Jeton de réinitialisation</label>
                <input
                  type="text"
                  className="form-input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Collez le token reçu"
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
                  placeholder="••••••••••••"
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
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStep("request")}
                  style={{ fontSize: 12.5, gap: 5 }}
                >
                  <ArrowLeft size={13} strokeWidth={2} />
                  <span>Retour</span>
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" />
                      <span>Réinitialisation...</span>
                    </>
                  ) : (
                    <span>Valider le nouveau mot de passe</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
