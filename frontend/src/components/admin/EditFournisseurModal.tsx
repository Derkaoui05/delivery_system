// src/components/admin/EditFournisseurModal.tsx
import { useState } from "react";
import { Edit3, X, AlertCircle, Check } from "lucide-react";
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
      setError(err.message || "Erreur lors de la modification du compte fournisseur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
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
              <Edit3 size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="modal-title">Modifier le profil fournisseur</h3>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{fournisseur.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fermer">
            <X size={16} strokeWidth={2} />
          </button>
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
              <label className="form-label">Responsable légal *</label>
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
              <label className="form-label">Numéro de téléphone *</label>
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
            <label className="form-label">Adresse de l'entrepôt / siège</label>
            <input
              className="form-input"
              value={form.adresse}
              onChange={(e) => set("adresse", e.target.value)}
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={15} strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: 6 }}>
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Check size={14} strokeWidth={2.4} />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
