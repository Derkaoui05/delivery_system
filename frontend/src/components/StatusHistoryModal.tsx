import { useEffect, useState } from "react";
import { getStatusMeta } from "../utils/statusHelpers";
import type { StatusHistory } from "../types";

interface Props {
  reference: string;
  fetchHistory: () => Promise<StatusHistory[]>;
  onClose: () => void;
}

function formatDateTime(str: string) {
  try {
    return new Date(str).toLocaleString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return str;
  }
}

export default function StatusHistoryModal({ reference, fetchHistory, onClose }: Props) {
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchHistory();
        setHistory(data || []);
      } catch (e: any) {
        setError(e.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchHistory]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">📋 Historique des statuts</div>
            <div style={{ fontSize: 12, color: "var(--brand-500)", fontFamily: "monospace", marginTop: 2 }}>{reference}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
            <div className="spinner" style={{ width: 28, height: 28, borderTopColor: "var(--brand-500)" }} />
          </div>
        ) : error ? (
          <div className="alert alert-error">⚠ {error}</div>
        ) : history.length === 0 ? (
          <div className="empty-state" style={{ padding: "24px 0" }}>
            <div className="empty-icon" style={{ fontSize: 32 }}>📭</div>
            <div className="empty-title">Aucun historique disponible</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {history.map((entry, idx) => {
              const meta = getStatusMeta(entry.statut);
              const isLast = idx === history.length - 1;
              return (
                <div key={idx} style={{ display: "flex", gap: 14, position: "relative" }}>
                  {/* Timeline line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div
                      style={{
                        width: 32, height: 32,
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14,
                        background: entry.statut === "ECHEC_LIVRAISON"
                          ? "rgba(239,68,68,0.15)"
                          : entry.statut === "LIVREE"
                          ? "rgba(16,185,129,0.15)"
                          : "var(--surface-3)",
                        border: `2px solid ${
                          entry.statut === "ECHEC_LIVRAISON" ? "rgba(239,68,68,0.4)"
                          : entry.statut === "LIVREE" ? "rgba(16,185,129,0.4)"
                          : "var(--border)"
                        }`,
                        flexShrink: 0,
                      }}
                    >
                      {meta.icon}
                    </div>
                    {!isLast && (
                      <div style={{ width: 2, flex: 1, background: "var(--border)", minHeight: 20, margin: "4px 0" }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                      <span className={`badge ${meta.badgeClass}`}>
                        <span className="badge-dot" />
                        {meta.label}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {formatDateTime(entry.changeAt)}
                      </span>
                    </div>
                    {entry.motifEchec && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          fontSize: 12,
                          color: "var(--red)",
                        }}
                      >
                        ⚠ Motif : {entry.motifEchec}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
