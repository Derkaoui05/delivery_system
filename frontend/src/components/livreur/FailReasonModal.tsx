// src/components/livreur/FailReasonModal.tsx
import { useState } from "react";
import type { Livraison } from "../../types";

interface FailReasonModalProps {
  livraison: Livraison;
  onClose: () => void;
  onConfirm: (motif: string) => Promise<void>;
}

export default function FailReasonModal({
  livraison,
  onClose,
  onConfirm,
}: FailReasonModalProps) {
  const [motif, setMotif] = useState("");
  const [loading, setLoading] = useState(false);
  const presets = [
    "Adresse introuvable",
    "Client absent",
    "Refus de réception",
    "Problème d'accès",
    "Autre",
  ];

  const submit = async () => {
    if (!motif.trim()) return;
    setLoading(true);
    try {
      await onConfirm(motif);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">❌ Déclarer un échec</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="card card-sm" style={{ marginBottom: 16, background: "var(--surface-3)" }}>
          <span className="td-primary text-mono" style={{ fontSize: 13 }}>
            {livraison.reference}
          </span>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            {livraison.clientNom} — {livraison.clientVille}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              className={`btn btn-sm ${motif === p ? "btn-danger" : "btn-ghost"}`}
              onClick={() => setMotif(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Motif détaillé</label>
          <input
            className="form-input"
            placeholder="Précisez la raison de l'échec..."
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={submit}
            disabled={loading || !motif.trim()}
          >
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Confirmer l'échec"}
          </button>
        </div>
      </div>
    </div>
  );
}
