// src/components/StatusHistoryModal.tsx
import { useEffect, useState } from "react";
import { History, X, AlertTriangle, Inbox } from "lucide-react";
import { getStatusMeta } from "../utils/statusHelpers";
import type { StatusHistory } from "../types";

interface Props {
  reference?: string;
  livraison?: { reference: string };
  fetchHistory: () => Promise<StatusHistory[]>;
  onClose: () => void;
}

function formatDateTime(str: string) {
  try {
    return new Date(str).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return str;
  }
}

export default function StatusHistoryModal({ reference, livraison, fetchHistory, onClose }: Props) {
  const displayRef = reference || livraison?.reference || "Expédition";
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchHistory();
        setHistory(data || []);
      } catch (e: any) {
        setError(e.message || "Erreur de chargement de l'historique");
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchHistory]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
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
              <History size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="modal-title">Historique des statuts</h3>
              <div style={{ fontSize: 11.5, color: "var(--brand-400)", fontFamily: "var(--font-mono)", fontWeight: 600, marginTop: 2 }}>
                {displayRef}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fermer">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
            <div className="spinner" style={{ width: 24, height: 24, color: "var(--brand-400)" }} />
            <span style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 10 }}>Récupération des jalons...</span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <AlertTriangle size={15} strokeWidth={2} />
            <span>{error}</span>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 0" }}>
            <div className="empty-icon">
              <Inbox size={36} strokeWidth={1.5} />
            </div>
            <div className="empty-title">Aucun historique disponible</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingTop: 6 }}>
            {history.map((entry, idx) => {
              const meta = getStatusMeta(entry.statut);
              const isLast = idx === history.length - 1;
              return (
                <div key={idx} style={{ display: "flex", gap: 14, position: "relative" }}>
                  {/* Timeline node */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          entry.statut === "ECHEC_LIVRAISON"
                            ? "var(--rose-surface)"
                            : entry.statut === "LIVREE"
                            ? "var(--emerald-surface)"
                            : "var(--surface-3)",
                        border: `2px solid ${
                          entry.statut === "ECHEC_LIVRAISON"
                            ? "rgba(244, 63, 94, 0.45)"
                            : entry.statut === "LIVREE"
                            ? "rgba(16, 185, 129, 0.45)"
                            : "var(--border)"
                        }`,
                        flexShrink: 0,
                      }}
                    >
                      {meta.icon}
                    </div>
                    {!isLast && (
                      <div style={{ width: 2, flex: 1, background: "var(--border)", minHeight: 22, margin: "4px 0" }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                      <span className={`badge ${meta.badgeClass}`}>
                        <span>{meta.label}</span>
                      </span>
                      <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                        {formatDateTime(entry.changeAt)}
                      </span>
                    </div>
                    {entry.motifEchec && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: "6px 10px",
                          borderRadius: "var(--radius-xs)",
                          background: "var(--rose-surface)",
                          border: "1px solid rgba(244, 63, 94, 0.25)",
                          fontSize: 12,
                          color: "var(--rose-400)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <AlertTriangle size={13} strokeWidth={2} />
                        <span>Motif : {entry.motifEchec}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
