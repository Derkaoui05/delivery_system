// src/components/livreur/FailReasonModal.tsx
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
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
    "Client absent",
    "Adresse introuvable / erronée",
    "Refus de réception",
    "Accès bloqué / problème de sécurité",
    "Autre motif exceptionnel",
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
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <AlertTriangle size={18} strokeWidth={2} style={{ color: "var(--rose-400)" }} />
            <h3 className="modal-title">Déclarer un échec de livraison</h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fermer">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="card card-sm" style={{ marginBottom: 18, background: "var(--surface-2)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="td-primary text-mono" style={{ fontSize: 13 }}>
              {livraison.reference}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{livraison.clientVille}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>
            Destinataire : <strong style={{ color: "var(--text-primary)" }}>{livraison.clientNom}</strong>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="form-label" style={{ marginBottom: 8, display: "block" }}>
            Motifs fréquents prédéfinis
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                className={`btn btn-sm ${motif === p ? "btn-danger" : "btn-ghost"}`}
                style={{ fontSize: 12 }}
                onClick={() => setMotif(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Motif ou précision complémentaire *</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Détaillez la raison pour le rapport logistique..."
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
            style={{ gap: 7 }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} strokeWidth={2} />
                <span>Confirmer l'échec</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
