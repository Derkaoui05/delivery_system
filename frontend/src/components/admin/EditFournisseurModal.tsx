// src/components/admin/EditFournisseurModal.tsx
import { useState } from "react";
import { api } from "../../api";
import type { Fournisseur, UpdateFournisseurRequest } from "../../types";

interface EditFournisseurModalProps {
  fournisseur: Fournisseur;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditFournisseurModal({
  fournisseur,
  onClose,
  onSuccess,
}: EditFournisseurModalProps) {
  const [form, setForm] = useState<UpdateFournisseurRequest>({
    raisonSociale: fournisseur.raisonSociale,
    responsable: fournisseur.responsable,
    telephone: fournisseur.telephone,
    adresse: fournisseur.adresse || "",
    ville: fournisseur.ville,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof UpdateFournisseurRequest, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.adminUpdateFournisseur(fournisseur.id, form);
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
          <span className="modal-title">✏️ Modifier le fournisseur</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
          {fournisseur.email}
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Raison sociale *</label>
              <input
                className="form-input"
                value={form.raisonSociale}
                onChange={(e) => set("raisonSociale", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Responsable *</label>
              <input
                className="form-input"
                value={form.responsable}
                onChange={(e) => set("responsable", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
              <input
                className="form-input"
                value={form.telephone}
                onChange={(e) => set("telephone", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ville *</label>
              <input
                className="form-input"
                value={form.ville}
                onChange={(e) => set("ville", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input
              className="form-input"
              value={form.adresse}
              onChange={(e) => set("adresse", e.target.value)}
            />
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
                "Enregistrer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
