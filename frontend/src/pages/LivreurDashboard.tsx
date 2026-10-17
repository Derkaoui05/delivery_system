// src/pages/LivreurDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import {
  Truck,
  History,
  RotateCw,
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  Eye,
  MapPin,
  Building2,
  Clock,
  ArrowRight,
  User,
  Inbox,
} from "lucide-react";
import { api } from "../api";
import Layout, { type NavItem } from "../components/Layout";
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

  const navItems: NavItem[] = [
    {
      id: "actives",
      label: "Missions en cours",
      icon: <Truck size={17} strokeWidth={1.8} />,
      active: tab === "actives",
      onClick: () => setTab("actives"),
    },
    {
      id: "historique",
      label: "Historique d'activité",
      icon: <History size={17} strokeWidth={1.8} />,
      active: tab === "historique",
      onClick: () => setTab("historique"),
    },
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
      subtitle="Feuille de route logistique et exécution des livraisons"
      navItems={navItems}
      topbarRight={
        <button className="btn btn-ghost btn-sm" onClick={load} style={{ gap: 6 }}>
          <RotateCw size={13} strokeWidth={2} className={loading ? "spinner" : ""} />
          <span>Actualiser</span>
        </button>
      }
    >
      {/* Stats KPI Grid */}
      <div className="stats-grid">
        {[
          { label: "Total missions", value: stats.total, icon: Package, color: "var(--amber-400)" },
          { label: "Missions actives", value: stats.actives, icon: Truck, color: "var(--sky-400)" },
          { label: "Livrées avec succès", value: stats.livrees, icon: CheckCircle2, color: "var(--emerald-400)" },
          { label: "Échecs signalés", value: stats.echecs, icon: AlertTriangle, color: "var(--rose-400)" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card" style={{ "--stat-color": s.color } as React.CSSProperties}>
              <div className="stat-icon">
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs & Search Filter Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 22,
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

        <div className="search-wrapper" style={{ maxWidth: 320 }}>
          <div className="search-icon">
            <Search size={14} strokeWidth={2} />
          </div>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Filtrer par réf, destinataire ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner" style={{ width: 28, height: 28, color: "var(--amber-400)" }} />
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>Synchronisation de vos tournées...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Inbox size={42} strokeWidth={1.5} />
          </div>
          <div className="empty-title">
            {tab === "actives" ? "Aucune mission active" : "Aucun historique pour le moment"}
          </div>
          <div className="text-sm">
            {search
              ? "Aucune livraison ne correspond à votre recherche."
              : tab === "actives"
              ? "Vous n'avez pas de colis assigné à livrer pour le moment."
              : "Vos missions terminées s'afficheront ici."}
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
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>
                      {l.reference}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                      <Building2 size={12} strokeWidth={1.8} style={{ color: "var(--emerald-400)" }} />
                      <span>Expéditeur :</span>
                      <strong style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{l.fournisseurNom || "Fournisseur"}</strong>
                    </div>
                  </div>
                  <span className={`badge ${meta.badgeClass}`}>
                    <span style={{ display: "inline-flex" }}>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </span>
                </div>

                {/* Logistics details card */}
                <div
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px 14px",
                    marginBottom: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <User size={13} strokeWidth={2} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)", width: 75, flexShrink: 0 }}>Destinataire</span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{l.clientNom}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <MapPin size={13} strokeWidth={2} style={{ color: "var(--amber-400)", flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)", width: 75, flexShrink: 0 }}>Destination</span>
                    <span style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      <strong style={{ color: "var(--text-primary)" }}>{l.clientVille}</strong>
                      {l.clientAdresse && ` — ${l.clientAdresse}`}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Package size={13} strokeWidth={2} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)", width: 75, flexShrink: 0 }}>Contenu</span>
                    <span style={{ fontSize: 12.5, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.descriptionColis}
                    </span>
                  </div>

                  {l.dateSouhaiteeLivraison && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={13} strokeWidth={2} style={{ color: "var(--brand-400)", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "var(--text-muted)", width: 75, flexShrink: 0 }}>Échéance</span>
                      <span style={{ fontSize: 12.5, color: "var(--brand-400)", fontWeight: 600 }}>{formatDate(l.dateSouhaiteeLivraison)}</span>
                    </div>
                  )}
                </div>

                {/* Progress bar for active */}
                {isActive && <StatusProgress status={l.status} />}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 7, marginTop: 16 }}>
                  {isActive && nextStatus && (
                    <button
                      className="btn btn-success btn-sm"
                      style={{ flex: 1, gap: 6 }}
                      onClick={() => handleAdvance(l)}
                      disabled={actionLoading === l.id}
                    >
                      {actionLoading === l.id ? (
                        <span className="spinner" style={{ width: 14, height: 14 }} />
                      ) : (
                        <>
                          <span>{getStatusMeta(nextStatus).label}</span>
                          <ArrowRight size={13} strokeWidth={2.2} />
                        </>
                      )}
                    </button>
                  )}
                  {isActive && canFail && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setFailModal({ livraison: l })}
                      title="Déclarer un échec"
                      style={{ gap: 5 }}
                    >
                      <AlertTriangle size={13} strokeWidth={2} />
                      <span>Échec</span>
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDetailTarget(l)}
                    title="Voir le dossier complet"
                  >
                    <Eye size={13} strokeWidth={1.8} />
                    <span>Détails</span>
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setHistoryTarget(l)}
                    title="Timeline historique"
                  >
                    <History size={13} strokeWidth={1.8} />
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