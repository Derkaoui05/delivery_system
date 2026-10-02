// src/pages/LivreurDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import Layout from "../components/Layout";
import StatusHistoryModal from "../components/StatusHistoryModal";
import { getStatusMeta, LIVREUR_NEXT_STATUS } from "../utils/statusHelpers";

import type { Livraison } from "../types";
import { formatDate } from "../utils/date";
import StatusProgress from "../components/livreur/StatusProgress";
import FailReasonModal from "../components/livreur/FailReasonModal";

type FailModal = { livraison: Livraison } | null;

export default function LivreurDashboard() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [failModal, setFailModal] = useState<FailModal>(null);
  const [historyTarget, setHistoryTarget] = useState<Livraison | null>(null);
  const [tab, setTab] = useState<"actives" | "historique">("actives");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.myLivraisonsLivreur();
      setLivraisons(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdvance = async (l: Livraison) => {
    const next = LIVREUR_NEXT_STATUS[l.status];
    if (!next) return;
    setActionLoading(l.id);
    try { await api.updateStatus(l.id, next); await load(); }
    finally { setActionLoading(null); }
  };

  const handleFail = async (id: string, motif: string) => {
    await api.updateStatus(id, "ECHEC_LIVRAISON", motif);
    await load();
  };

  const actives = livraisons.filter((l) => !["LIVREE", "ECHEC_LIVRAISON"].includes(l.status));
  const historique = livraisons.filter((l) => ["LIVREE", "ECHEC_LIVRAISON"].includes(l.status));

  const stats = {
    total: livraisons.length,
    actives: actives.length,
    livrees: livraisons.filter((l) => l.status === "LIVREE").length,
    echecs: livraisons.filter((l) => l.status === "ECHEC_LIVRAISON").length,
  };

  const navItems = [
    { id: "actives", label: "Missions actives", icon: "🚚", active: tab === "actives", onClick: () => setTab("actives") },
    { id: "historique", label: "Historique", icon: "📋", active: tab === "historique", onClick: () => setTab("historique") },
  ];

  const currentList = tab === "actives" ? actives : historique;

  return (
    <Layout
      role="LIVREUR"
      title="Mes missions"
      subtitle="Gérez vos livraisons en cours"
      navItems={navItems}
      topbarRight={
        <button className="btn btn-ghost btn-sm" onClick={load}>↻ Actualiser</button>
      }
    >
      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "Total missions", value: stats.total, icon: "📦", color: "var(--amber)" },
          { label: "En cours", value: stats.actives, icon: "🚚", color: "var(--sky)" },
          { label: "Livrées", value: stats.livrees, icon: "✅", color: "var(--emerald)" },
          { label: "Échecs", value: stats.echecs, icon: "❌", color: "var(--red)" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ "--stat-color": s.color } as React.CSSProperties}>
            <div className="stat-icon">{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab header */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "actives", label: `Missions actives (${actives.length})` },
          { id: "historique", label: `Historique (${historique.length})` },
        ].map((t) => (
          <button
            key={t.id}
            className={`btn ${tab === t.id ? "btn-primary" : "btn-ghost"} btn-sm`}
            onClick={() => setTab(t.id as "actives" | "historique")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner" style={{ width: 32, height: 32, borderTopColor: "var(--amber)" }} />
        </div>
      ) : currentList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{tab === "actives" ? "🏁" : "📋"}</div>
          <div className="empty-title">
            {tab === "actives" ? "Aucune mission active" : "Aucun historique"}
          </div>
          <div className="text-sm">
            {tab === "actives"
              ? "Vous n'avez pas de livraison à effectuer pour le moment"
              : "Vos livraisons terminées apparaîtront ici"}
          </div>
        </div>
      ) : (
        <div className="missions-grid">
          {currentList.map((l) => {
            const meta = getStatusMeta(l.status);
            const nextStatus = LIVREUR_NEXT_STATUS[l.status];
            const isActive = !["LIVREE", "ECHEC_LIVRAISON"].includes(l.status);
            const canFail = l.status === "EN_LIVRAISON";

            return (
              <div key={l.id} className="mission-card">
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                      {l.reference}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {l.fournisseurNom}
                    </div>
                  </div>
                  <span className={`badge ${meta.badgeClass}`}>
                    {meta.icon} {meta.label}
                  </span>
                </div>

                {/* Client info */}
                <div style={{
                  background: "var(--surface-3)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 12px",
                  marginBottom: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", width: 60, flexShrink: 0 }}>Client</span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{l.clientNom}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", width: 60, flexShrink: 0 }}>Ville</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{l.clientVille}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", width: 60, flexShrink: 0 }}>Colis</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.descriptionColis}
                    </span>
                  </div>
                  {l.dateSouhaiteeLivraison && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", width: 60, flexShrink: 0 }}>Délai</span>
                      <span style={{ fontSize: 13, color: "var(--amber)" }}>{formatDate(l.dateSouhaiteeLivraison)}</span>
                    </div>
                  )}
                </div>

                {/* Progress bar for active */}
                {isActive && <StatusProgress status={l.status} />}

                {/* Actions */}
                {isActive && (
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    {nextStatus && (
                      <button
                        className="btn btn-success"
                        style={{ flex: 1 }}
                        onClick={() => handleAdvance(l)}
                        disabled={actionLoading === l.id}
                      >
                        {actionLoading === l.id
                          ? <span className="spinner" style={{ width: 14, height: 14 }} />
                          : <>→ {getStatusMeta(nextStatus).label}</>}
                      </button>
                    )}
                    {canFail && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setFailModal({ livraison: l })}
                        title="Déclarer un échec"
                      >
                        ✕ Échec
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setHistoryTarget(l)}
                      title="Voir l'historique"
                    >
                      📋
                    </button>
                  </div>
                )}
                {!isActive && (
                  <div style={{ marginTop: 14 }}>
                    <button
                      className="btn btn-ghost btn-sm w-full"
                      onClick={() => setHistoryTarget(l)}
                    >
                      📋 Voir l'historique
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fail modal */}
      {failModal && (
        <FailReasonModal
          livraison={failModal.livraison}
          onClose={() => setFailModal(null)}
          onConfirm={(motif) => handleFail(failModal.livraison.id, motif)}
        />
      )}
      {/* History modal */}
      {historyTarget && (
        <StatusHistoryModal
          reference={historyTarget.reference}
          fetchHistory={() => api.livreurGetHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </Layout>
  );
}