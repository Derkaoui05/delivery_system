// src/components/RegisterFournisseurModal.tsx
import { useState } from "react";
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
      setError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 540, width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🏭</span>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Inscription Fournisseur
            </h3>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {error && (
            <div className="alert alert-error" style={{ fontSize: 13, padding: "8px 12px" }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Raison sociale *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex. Maroc Tech SARL"
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
              <label className="form-label">Adresse e-mail *</label>
              <input
                type="email"
                className="form-input"
                placeholder="contact@societe.ma"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
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
              <label className="form-label">Adresse siège *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex. 45 Bd Zerktouni"
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
            <label className="form-label">Mot de passe (min. 8 car.) *</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Création du compte..." : "Créer mon compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
