// src/components/admin/CreateLivreurModal.tsx
import { useState } from "react";
import { api } from "../../api";
import type { RegisterLivreurRequest } from "../../types";

interface CreateLivreurModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateLivreurModal({ onClose, onSuccess }: CreateLivreurModalProps) {
  const [form, setForm] = useState<RegisterLivreurRequest>({
    email: "",
    password: "",
    nom: "",
    telephone: "",
    adresse: "",
    ville: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof RegisterLivreurRequest, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createLivreur(form);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">➕ Créer un livreur</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nom complet *</label>
              <input
                className="form-input"
                placeholder="Jean Dupont"
                value={form.nom}
                onChange={(e) => set("nom", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
              <input
                className="form-input"
                placeholder="06 00 00 00 00"
                value={form.telephone}
                onChange={(e) => set("telephone", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">E-mail *</label>
            <input
              className="form-input"
              type="email"
              placeholder="jean@livraison.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe *</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Adresse</label>
              <input
                className="form-input"
                placeholder="Rue..."
                value={form.adresse}
                onChange={(e) => set("adresse", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ville *</label>
              <input
                className="form-input"
                placeholder="Casablanca"
                value={form.ville}
                onChange={(e) => set("ville", e.target.value)}
                required
              />
            </div>
          </div>
          {error && <div className="alert alert-error">⚠ {error}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span className="spinner" style={{ width: 14, height: 14 }} />
              ) : (
                "Créer le livreur"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
