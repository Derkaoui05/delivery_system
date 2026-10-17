// src/components/admin/EntityDeliveriesModal.tsx
import { useEffect, useState } from "react";
import { Package, X, Eye, AlertCircle, Inbox } from "lucide-react";
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
        if (mounted) setError(err.message || "Erreur de chargement des livraisons");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [fetchDeliveries]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 800, width: "95%", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface-2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-sm)",
                background: "var(--brand-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--brand-400)",
              }}
            >
              <Package size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontSize: 16.5, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                {title}
              </h3>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {subtitle} • <strong style={{ color: "var(--text-primary)" }}>{deliveries.length}</strong> expédition(s) trouvée(s)
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fermer">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div style={{ padding: 22, overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
              <div className="spinner" style={{ margin: "0 auto 12px", width: 22, height: 22 }} />
              <p style={{ fontSize: 13 }}>Chargement des expéditions associées...</p>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <AlertCircle size={15} strokeWidth={2} />
              <span>{error}</span>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="empty-state" style={{ padding: "36px 0" }}>
              <div className="empty-icon">
                <Inbox size={40} strokeWidth={1.5} />
              </div>
              <div className="empty-title">Aucune expédition enregistrée pour cette entité</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Statut</th>
                    <th>Destinataire</th>
                    <th>Ville</th>
                    <th>Date d'émission</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((l) => {
                    const meta = getStatusMeta(l.status);
                    return (
                      <tr key={l.id}>
                        <td className="td-primary">{l.reference}</td>
                        <td>
                          <span className={`badge ${meta.badgeClass}`}>
                            <span style={{ display: "inline-flex" }}>{meta.icon}</span>
                            <span>{meta.label}</span>
                          </span>
                        </td>
                        <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{l.clientNom}</td>
                        <td>{l.clientVille}</td>
                        <td style={{ fontSize: 12 }}>{formatDate(l.createdAt)}</td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ gap: 5 }}
                            onClick={() => {
                              onSelectDelivery(l);
                            }}
                          >
                            <Eye size={13} strokeWidth={1.8} />
                            <span>Détails</span>
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

        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", background: "var(--surface-2)" }}>
          <button className="btn btn-ghost" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
