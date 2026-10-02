// src/components/admin/AssignModal.tsx
import { useState } from "react";
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📋 Affecter un livreur</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="card card-sm" style={{ marginBottom: 16, background: "var(--surface-3)" }}>
          <div style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>
            {livraison.reference}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            {livraison.clientNom} — {livraison.clientVille}
          </div>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">
              Livreur disponible ({available.length})
            </label>
            <select
              className="form-select"
              value={livreurId}
              onChange={(e) => setLivreurId(e.target.value)}
              required
            >
              <option value="">— Sélectionner —</option>
              {available.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nom} — {l.ville}
                </option>
              ))}
            </select>
          </div>
          {available.length === 0 && (
            <div className="alert alert-error">⚠ Aucun livreur disponible pour le moment</div>
          )}
          {error && <div className="alert alert-error">⚠ {error}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !livreurId}
            >
              {loading ? (
                <span className="spinner" style={{ width: 14, height: 14 }} />
              ) : (
                "Affecter"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
