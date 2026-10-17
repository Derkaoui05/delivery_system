// src/components/RegisterFournisseurModal.tsx
import { useState } from "react";
import { Building2, X, AlertCircle, ArrowRight } from "lucide-react";
import { api } from "../api";

interface RegisterFournisseurModalProps {
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function RegisterFournisseurModal({ onClose, onSuccess }: RegisterFournisseurModalProps) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    raisonSociale: "",
    responsable: "",
    telephone: "",
    adresse: "",
    ville: "Casablanca",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      await api.registerFournisseur(form);
      onSuccess(form.email);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement du compte fournisseur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 560, width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-sm)",
                background: "var(--emerald-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--emerald-400)",
              }}
            >
              <Building2 size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="modal-title">Inscription Fournisseur / Expéditeur</h3>
              <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>
                Créez votre compte pour déléguer et suivre vos expéditions
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fermer">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={15} strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Raison sociale *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex. Atlas Distribution SARL"
                value={form.raisonSociale}
                onChange={(e) => set("raisonSociale", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nom du responsable *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex. Karim El Idrissi"
                value={form.responsable}
                onChange={(e) => set("responsable", e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Adresse e-mail professionnelle *</label>
              <input
                type="email"
                className="form-input"
                placeholder="contact@atlas.ma"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone de contact *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="0612345678"
                value={form.telephone}
                onChange={(e) => set("telephone", e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Adresse du siège / entrepôt *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex. 45 Boulevard Zerktouni"
                value={form.adresse}
                onChange={(e) => set("adresse", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ville *</label>
              <input
                type="text"
                className="form-input"
                value={form.ville}
                onChange={(e) => set("ville", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe sécurisé (min. 8 car.) *</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: 6 }}>
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Création du compte...</span>
                </>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <ArrowRight size={14} strokeWidth={2} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
