// src/components/admin/AssignModal.tsx
import { useState } from "react";
import { Bike, X, AlertCircle, UserCheck } from "lucide-react";
import { api } from "../../api";
import type { Livraison, Livreur } from "../../types";

interface AssignModalProps {
  livraison: Livraison;
  livreurs: Livreur[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignModal({
  livraison,
  livreurs,
  onClose,
  onSuccess,
}: AssignModalProps) {
  const [livreurId, setLivreurId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const available = livreurs.filter((l) => l.active && l.disponibilite === "DISPONIBLE");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!livreurId) {
      setError("Veuillez sélectionner un livreur");
      return;
    }
    setLoading(true);
    try {
      await api.assign(livraison.id, livreurId);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'affectation du livreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
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
              <Bike size={18} strokeWidth={2} />
            </div>
            <h3 className="modal-title">Affectation d'un livreur</h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fermer">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="card card-sm" style={{ marginBottom: 16, background: "var(--surface-2)" }}>
          <div style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            {livraison.reference}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>
            Destinataire : <strong style={{ color: "var(--text-primary)" }}>{livraison.clientNom}</strong> — {livraison.clientVille}
          </div>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">
              Livreurs actifs et disponibles ({available.length})
            </label>
            <select
              className="form-select"
              value={livreurId}
              onChange={(e) => setLivreurId(e.target.value)}
              required
            >
              <option value="">— Sélectionner un transporteur disponible —</option>
              {available.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nom} — {l.ville} ({l.telephone})
                </option>
              ))}
            </select>
          </div>

          {available.length === 0 && (
            <div className="alert alert-error">
              <AlertCircle size={15} strokeWidth={2} />
              <span>Aucun livreur avec le statut DISPONIBLE n'est prêt pour affectation</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={15} strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !livreurId}
              style={{ gap: 6 }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Affectation...</span>
                </>
              ) : (
                <>
                  <UserCheck size={14} strokeWidth={2} />
                  <span>Confirmer l'affectation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
