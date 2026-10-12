// src/components/admin/EntityDeliveriesModal.tsx
import { useEffect, useState } from "react";
import type { Livraison } from "../../types";
import { getStatusMeta } from "../../utils/statusHelpers";
import { formatDate } from "../../utils/date";

interface EntityDeliveriesModalProps {
  title: string;
  subtitle: string;
  fetchDeliveries: () => Promise<Livraison[]>;
  onSelectDelivery: (l: Livraison) => void;
  onClose: () => void;
}

export default function EntityDeliveriesModal({
  title,
  subtitle,
  fetchDeliveries,
  onSelectDelivery,
  onClose,
}: EntityDeliveriesModalProps) {
  const [deliveries, setDeliveries] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchDeliveries()
      .then((res) => {
        if (mounted) setDeliveries(res || []);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Erreur de chargement");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [fetchDeliveries]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 760, width: "95%", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              {title}
            </h3>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {subtitle} ({deliveries.length} livraison(s))
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />
              Chargement des livraisons...
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          ) : deliveries.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 0" }}>
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">Aucune livraison enregistrée</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Statut</th>
                    <th>Client</th>
                    <th>Ville</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((l) => {
                    const meta = getStatusMeta(l.status);
                    return (
                      <tr key={l.id}>
                        <td style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>{l.reference}</td>
                        <td>
                          <span className={`badge ${meta.badgeClass}`}>
                            <span className="badge-dot" />
                            {meta.label}
                          </span>
                        </td>
                        <td>{l.clientNom}</td>
                        <td>{l.clientVille}</td>
                        <td>{formatDate(l.createdAt)}</td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: "2px 8px" }}
                            onClick={() => {
                              onSelectDelivery(l);
                            }}
                          >
                            👁 Détails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
