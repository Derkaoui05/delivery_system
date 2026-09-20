// src/pages/LivreurDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import Layout from "../components/Layout";
import { getStatusMeta, LIVREUR_NEXT_STATUS } from "../utils/statusHelpers";

type Livraison = {
  id: string;
  reference: string;
  status: string;
  clientNom: string;
  clientVille: string;
  descriptionColis: string;
  fournisseurNom: string;
  dateSouhaiteeLivraison: string | null;
  createdAt: string;
};

type FailModal = { livraison: Livraison } | null;

const STATUS_STEPS = ["AFFECTEE", "COLIS_RECUPERE", "EN_LIVRAISON", "LIVREE"];

function formatDate(str: string | null) {
  if (!str) return "—";
  try { return new Date(str).toLocaleDateString("fr-FR"); } catch { return str; }
}

function StatusProgress({ status }: { status: string }) {
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 12 }}>
      {STATUS_STEPS.map((step, i) => {
        const done = i <= idx;
        const current = i === idx;
        const meta = getStatusMeta(step);
        return (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < STATUS_STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 28, height: 28,
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12,
                  background: done ? (current ? "var(--brand-500)" : "var(--emerald)") : "var(--surface-3)",
                  border: `2px solid ${done ? (current ? "var(--brand-500)" : "var(--emerald)") : "var(--border)"}`,
                  boxShadow: current ? "0 0 10px var(--brand-glow)" : "none",
                  transition: "all 300ms",
                }}
              >
                {done ? (current ? "●" : "✓") : "○"}
              </div>
              <span style={{ fontSize: 10, color: done ? "var(--text-secondary)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
                {meta.label.split(" ")[0]}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                style={{
                  flex: 1, height: 2,
                  background: i < idx ? "var(--emerald)" : "var(--border)",
                  margin: "0 4px",
                  marginBottom: 16,
                  transition: "background 300ms",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FailReasonModal({ livraison, onClose, onConfirm }: {
  livraison: Livraison;
  onClose: () => void;
  onConfirm: (motif: string) => Promise<void>;
}) {
  const [motif, setMotif] = useState("");
  const [loading, setLoading] = useState(false);
  const presets = ["Adresse introuvable", "Client absent", "Refus de réception", "Problème d'accès", "Autre"];

  const submit = async () => {
    if (!motif.trim()) return;
    setLoading(true);
    try { await onConfirm(motif); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">❌ Déclarer un échec</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="card card-sm" style={{ marginBottom: 16, background: "var(--surface-3)" }}>
          <span className="td-primary text-mono" style={{ fontSize: 13 }}>{livraison.reference}</span>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            {livraison.clientNom} — {livraison.clientVille}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {presets.map((p) => (
            <button
              key={p}
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
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-danger" onClick={submit} disabled={loading || !motif.trim()}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Confirmer l'échec"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LivreurDashboard() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [failModal, setFailModal] = useState<FailModal>(null);
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
    </Layout>
  );
}