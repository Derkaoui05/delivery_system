// src/pages/LivreurDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import Layout from "../components/Layout";
import StatusHistoryModal from "../components/StatusHistoryModal";
import DeliveryDetailModal from "../components/DeliveryDetailModal";
import { getStatusMeta, LIVREUR_NEXT_STATUS } from "../utils/statusHelpers";

import type { Livraison, LivreurDashboardStats } from "../types";
import { formatDate } from "../utils/date";
import StatusProgress from "../components/livreur/StatusProgress";
import FailReasonModal from "../components/livreur/FailReasonModal";

type FailModal = { livraison: Livraison } | null;

export default function LivreurDashboard() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [dashboardStats, setDashboardStats] = useState<LivreurDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [failModal, setFailModal] = useState<FailModal>(null);
  const [historyTarget, setHistoryTarget] = useState<Livraison | null>(null);
  const [detailTarget, setDetailTarget] = useState<Livraison | null>(null);
  const [tab, setTab] = useState<"actives" | "historique">("actives");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.allSettled([
        api.myLivraisonsLivreur(),
        api.getLivreurDashboard(),
      ]);

      if (listRes.status === "fulfilled") {
        setLivraisons(listRes.value || []);
      }
      if (statsRes.status === "fulfilled") {
        setDashboardStats(statsRes.value);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdvance = async (l: Livraison) => {
    const next = LIVREUR_NEXT_STATUS[l.status];
    if (!next) return;
    setActionLoading(l.id);
    try {
      await api.updateStatus(l.id, next);
      await load();
    } finally {
      setActionLoading(null);
    }
  };

  const handleFail = async (id: string, motif: string) => {
    await api.updateStatus(id, "ECHEC_LIVRAISON", motif);
    await load();
  };

  const actives = livraisons.filter((l) => !["LIVREE", "ECHEC_LIVRAISON"].includes(l.status));
  const historique = livraisons.filter((l) => ["LIVREE", "ECHEC_LIVRAISON"].includes(l.status));

  const stats = {
    total: dashboardStats?.totalMissions ?? livraisons.length,
    actives: dashboardStats?.enCours ? (dashboardStats.enCours + (dashboardStats.affectees || 0)) : actives.length,
    livrees: dashboardStats?.livrees ?? livraisons.filter((l) => l.status === "LIVREE").length,
    echecs: dashboardStats?.echouees ?? livraisons.filter((l) => l.status === "ECHEC_LIVRAISON").length,
  };

  const navItems = [
    { id: "actives", label: "Missions actives", icon: "🚚", active: tab === "actives", onClick: () => setTab("actives") },
    { id: "historique", label: "Historique", icon: "📋", active: tab === "historique", onClick: () => setTab("historique") },
  ];

  const currentList = (tab === "actives" ? actives : historique).filter((l) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      l.reference.toLowerCase().includes(term) ||
      l.clientNom.toLowerCase().includes(term) ||
      l.clientVille.toLowerCase().includes(term) ||
      (l.fournisseurNom && l.fournisseurNom.toLowerCase().includes(term))
    );
  });

  return (
    <Layout
      role="LIVREUR"
      title="Espace Livreur"
      subtitle="Vos missions de transport et suivi des livraisons"
      navItems={navItems}
      topbarRight={
        <button className="btn btn-ghost btn-sm" onClick={load}>
          ↻ Actualiser
        </button>
      }
    >
      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { label: "Total missions", value: stats.total, icon: "📦", color: "var(--amber)" },
          { label: "Missions en cours", value: stats.actives, icon: "🚚", color: "var(--sky)" },
          { label: "Livrées avec succès", value: stats.livrees, icon: "✅", color: "var(--emerald)" },
          { label: "Échecs signalés", value: stats.echecs, icon: "❌", color: "var(--red)" },
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

      {/* Tabs & Search Filter Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
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

        <div style={{ width: 280 }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Filtrer par réf, client ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: 13, padding: "7px 12px" }}
          />
        </div>
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
            {search
              ? "Aucun résultat ne correspond à votre recherche."
              : tab === "actives"
              ? "Vous n'avez pas de livraison à effectuer pour le moment."
              : "Vos livraisons passées apparaîtront ici."}
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
                      📍 Expéditeur: <strong style={{ color: "var(--text-secondary)" }}>{l.fournisseurNom || "Fournisseur"}</strong>
                    </div>
                  </div>
                  <span className={`badge ${meta.badgeClass}`}>
                    {meta.icon} {meta.label}
                  </span>
                </div>

                {/* Client / Destination info */}
                <div
                  style={{
                    background: "var(--surface-3)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 12px",
                    marginBottom: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", width: 65, flexShrink: 0 }}>Client</span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{l.clientNom}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", width: 65, flexShrink: 0 }}>Ville</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{l.clientVille}</span>
                  </div>
                  {l.clientAdresse && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", width: 65, flexShrink: 0 }}>Adresse</span>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{l.clientAdresse}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", width: 65, flexShrink: 0 }}>Colis</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.descriptionColis}
                    </span>
                  </div>
                  {l.dateSouhaiteeLivraison && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", width: 65, flexShrink: 0 }}>Délai</span>
                      <span style={{ fontSize: 13, color: "var(--amber)" }}>{formatDate(l.dateSouhaiteeLivraison)}</span>
                    </div>
                  )}
                </div>

                {/* Progress bar for active */}
                {isActive && <StatusProgress status={l.status} />}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                  {isActive && nextStatus && (
                    <button
                      className="btn btn-success btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleAdvance(l)}
                      disabled={actionLoading === l.id}
                    >
                      {actionLoading === l.id ? (
                        <span className="spinner" style={{ width: 14, height: 14 }} />
                      ) : (
                        <>→ {getStatusMeta(nextStatus).label}</>
                      )}
                    </button>
                  )}
                  {isActive && canFail && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setFailModal({ livraison: l })}
                      title="Déclarer un échec"
                    >
                      ✕ Échec
                    </button>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDetailTarget(l)}
                    title="Voir les détails complets (adresses Point A & B, téléphone, instructions)"
                  >
                    👁 Détails
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setHistoryTarget(l)}
                    title="Historique des statuts"
                  >
                    🕒
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {detailTarget && (
        <DeliveryDetailModal
          livraisonId={detailTarget.id}
          fetchDetail={(id) => api.getDeliveryDetail(id)}
          onClose={() => setDetailTarget(null)}
        />
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
          livraison={historyTarget}
          fetchHistory={() => api.livreurGetHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </Layout>
  );
}