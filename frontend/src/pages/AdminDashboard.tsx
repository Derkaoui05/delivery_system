// src/pages/AdminDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import Layout from "../components/Layout";
import StatusHistoryModal from "../components/StatusHistoryModal";
import DeliveryDetailModal from "../components/DeliveryDetailModal";
import EntityDeliveriesModal from "../components/admin/EntityDeliveriesModal";
import { getStatusMeta, ALL_STATUTS } from "../utils/statusHelpers";

import type { Livraison, Livreur, Fournisseur, AuditLog, PageResponse } from "../types";
import CreateLivreurModal from "../components/admin/CreateLivreurModal";
import EditLivreurModal from "../components/admin/EditLivreurModal";
import EditFournisseurModal from "../components/admin/EditFournisseurModal";
import AssignModal from "../components/admin/AssignModal";
import { formatDate } from "../utils/date";

type Tab = "livraisons" | "livreurs" | "fournisseurs" | "audit";

interface SelectedEntityDeliveries {
  title: string;
  subtitle: string;
  fetchFn: () => Promise<Livraison[]>;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("livraisons");
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [auditLogs, setAuditLogs] = useState<PageResponse<AuditLog> | null>(null);
  const [auditPage, setAuditPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Advanced search filters for Livraisons
  const [filterReference, setFilterReference] = useState("");
  const [filterVille, setFilterVille] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterFournisseurId, setFilterFournisseurId] = useState("");
  const [filterLivreurId, setFilterLivreurId] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Modals state
  const [showCreateLivreur, setShowCreateLivreur] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Livraison | null>(null);
  const [editLivreur, setEditLivreur] = useState<Livreur | null>(null);
  const [editFournisseur, setEditFournisseur] = useState<Fournisseur | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Livraison | null>(null);
  const [detailTarget, setDetailTarget] = useState<Livraison | null>(null);
  const [entityDeliveries, setEntityDeliveries] = useState<SelectedEntityDeliveries | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [l, d, f] = await Promise.all([
        api.adminSearchLivraisons({
          reference: filterReference || undefined,
          ville: filterVille || undefined,
          statut: filterStatut || undefined,
          fournisseurId: filterFournisseurId || undefined,
          livreurId: filterLivreurId || undefined,
          clientNom: filterClient || undefined,
          dateFrom: filterDateFrom || undefined,
          dateTo: filterDateTo || undefined,
        }),
        api.listLivreurs(),
        api.adminListFournisseurs(),
      ]);
      setLivraisons(l || []);
      setLivreurs(d || []);
      setFournisseurs(f || []);
    } finally {
      setLoading(false);
    }
  }, [
    filterReference,
    filterVille,
    filterStatut,
    filterFournisseurId,
    filterLivreurId,
    filterClient,
    filterDateFrom,
    filterDateTo,
  ]);

  const loadAuditLogs = useCallback(async (page: number) => {
    try {
      const logs = await api.adminGetAuditLogs(page, 15);
      setAuditLogs(logs);
    } catch (e) {
      console.error("Failed to load audit logs", e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (tab === "audit") {
      loadAuditLogs(auditPage);
    }
  }, [tab, auditPage, loadAuditLogs]);

  const handleValidate = async (id: string) => {
    setActionLoading(id);
    try {
      await api.validate(id);
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDisponibilite = async (l: Livreur, value: string) => {
    setActionLoading(l.id + "-dispo");
    try {
      await api.adminSetDisponibilite(l.id, value);
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateLivreur = async (id: string) => {
    if (!confirm("Désactiver ce livreur ?")) return;
    setActionLoading(id);
    try {
      await api.adminDeactivateLivreur(id);
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFournisseur = async (f: Fournisseur) => {
    setActionLoading(f.id);
    try {
      f.active ? await api.adminDeactivateFournisseur(f.id) : await api.adminActivateFournisseur(f.id);
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const resetFilters = () => {
    setFilterReference("");
    setFilterVille("");
    setFilterStatut("");
    setFilterFournisseurId("");
    setFilterLivreurId("");
    setFilterClient("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  // Stats calculation
  const stats = {
    total: livraisons.length,
    enAttente: livraisons.filter((l) => l.status === "EN_ATTENTE").length,
    validees: livraisons.filter((l) => l.status === "VALIDEE").length,
    affectees: livraisons.filter((l) => l.status === "AFFECTEE").length,
    enCours: livraisons.filter((l) => ["COLIS_RECUPERE", "EN_LIVRAISON"].includes(l.status)).length,
    livrees: livraisons.filter((l) => l.status === "LIVREE").length,
    echecs: livraisons.filter((l) => l.status === "ECHEC_LIVRAISON").length,
    totalFournisseurs: fournisseurs.length,
    totalLivreurs: livreurs.length,
    dispoLivreurs: livreurs.filter((d) => d.disponibilite === "DISPONIBLE").length,
  };

  const navItems = [
    { id: "livraisons", label: "Toutes les livraisons", icon: "📦", active: tab === "livraisons", onClick: () => setTab("livraisons") },
    { id: "livreurs", label: "Gestion Livreurs", icon: "🛵", active: tab === "livreurs", onClick: () => setTab("livreurs") },
    { id: "fournisseurs", label: "Gestion Fournisseurs", icon: "🏭", active: tab === "fournisseurs", onClick: () => setTab("fournisseurs") },
    { id: "audit", label: "Journal d'audit (Sécurité)", icon: "🛡️", active: tab === "audit", onClick: () => setTab("audit") },
  ];

  return (
    <Layout
      role="ADMIN"
      title="Centre d'Administration"
      subtitle="Supervision globale de la plateforme, affectations et audit"
      navItems={navItems}
      topbarRight={
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={loadData}>
            ↻ Actualiser
          </button>
          {tab === "livreurs" && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateLivreur(true)}>
              + Nouveau Livreur
            </button>
          )}
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { label: "Total Livraisons", value: stats.total, icon: "📦", color: "var(--brand-500)" },
          { label: "En Attente", value: stats.enAttente, icon: "⏳", color: "var(--amber)" },
          { label: "Validées / Affectées", value: stats.validees + stats.affectees, icon: "📋", color: "var(--sky)" },
          { label: "Livrées avec succès", value: stats.livrees, icon: "✅", color: "var(--emerald)" },
          { label: "Échecs signalés", value: stats.echecs, icon: "❌", color: "var(--red)" },
          { label: "Livreurs Dispo", value: `${stats.dispoLivreurs}/${stats.totalLivreurs}`, icon: "🛵", color: "var(--brand-600)" },
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

      {/* Tab: Livraisons */}
      {tab === "livraisons" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Advanced Search & Filter Bar */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface-2)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                🔍 Filtres de recherche avancés (Critères dynamiques)
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11, padding: "2px 8px" }}
                onClick={resetFilters}
              >
                Réinitialiser les filtres
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Réf. (ex. LIV-2026)"
                value={filterReference}
                onChange={(e) => setFilterReference(e.target.value)}
                style={{ fontSize: 12 }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Ville (ex. Casablanca)"
                value={filterVille}
                onChange={(e) => setFilterVille(e.target.value)}
                style={{ fontSize: 12 }}
              />
              <select
                className="form-input"
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                style={{ fontSize: 12 }}
              >
                <option value="">Tous les statuts</option>
                {ALL_STATUTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                className="form-input"
                value={filterFournisseurId}
                onChange={(e) => setFilterFournisseurId(e.target.value)}
                style={{ fontSize: 12 }}
              >
                <option value="">Tous les fournisseurs</option>
                {fournisseurs.map((f) => (
                  <option key={f.id} value={f.id}>{f.raisonSociale}</option>
                ))}
              </select>
              <select
                className="form-input"
                value={filterLivreurId}
                onChange={(e) => setFilterLivreurId(e.target.value)}
                style={{ fontSize: 12 }}
              >
                <option value="">Tous les livreurs</option>
                {livreurs.map((d) => (
                  <option key={d.id} value={d.id}>{d.nom}</option>
                ))}
              </select>
              <input
                type="text"
                className="form-input"
                placeholder="Nom / Tél client"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                style={{ fontSize: 12 }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="date"
                  className="form-input"
                  title="Date début"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  style={{ fontSize: 11, padding: "6px" }}
                />
                <input
                  type="date"
                  className="form-input"
                  title="Date fin"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  style={{ fontSize: 11, padding: "6px" }}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />
              Recherche des livraisons en cours...
            </div>
          ) : livraisons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">Aucune livraison trouvée</div>
              <div className="empty-state-sub">Modifiez vos critères de recherche ou réinitialisez les filtres.</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Statut</th>
                    <th>Fournisseur (Point A)</th>
                    <th>Client (Point B)</th>
                    <th>Ville</th>
                    <th>Livreur</th>
                    <th>Créée le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {livraisons.map((l) => {
                    const meta = getStatusMeta(l.status);
                    return (
                      <tr key={l.id}>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ fontFamily: "monospace", fontSize: 12, padding: "3px 8px" }}
                            onClick={() => setDetailTarget(l)}
                            title="Voir les détails complets"
                          >
                            {l.reference} 🔍
                          </button>
                        </td>
                        <td>
                          <span className={`badge ${meta.badgeClass}`}>
                            <span className="badge-dot" />
                            {meta.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{l.fournisseurNom || "—"}</div>
                        </td>
                        <td>
                          <div>{l.clientNom}</div>
                          {l.clientTelephone && (
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{l.clientTelephone}</div>
                          )}
                        </td>
                        <td>{l.clientVille}</td>
                        <td>
                          {l.livreurNom ? (
                            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{l.livreurNom}</span>
                          ) : (
                            <span style={{ color: "var(--amber)", fontSize: 12 }}>À affecter</span>
                          )}
                        </td>
                        <td>{formatDate(l.createdAt)}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {l.status === "EN_ATTENTE" && (
                              <button
                                className="btn btn-success btn-sm"
                                style={{ fontSize: 11, padding: "3px 8px" }}
                                onClick={() => handleValidate(l.id)}
                                disabled={actionLoading === l.id}
                              >
                                {actionLoading === l.id ? "..." : "✓ Valider"}
                              </button>
                            )}

                            {(l.status === "VALIDEE" || l.status === "AFFECTEE") && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: 11, padding: "3px 8px" }}
                                onClick={() => setAssignTarget(l)}
                              >
                                {l.livreurNom ? "Changer" : "Affecter"}
                              </button>
                            )}

                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11, padding: "3px 8px" }}
                              onClick={() => setDetailTarget(l)}
                              title="Détails complets Point A / Point B"
                            >
                              👁
                            </button>

                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: 11, padding: "3px 8px" }}
                              onClick={() => setHistoryTarget(l)}
                              title="Historique des transitions"
                            >
                              🕒
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Livreurs */}
      {tab === "livreurs" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom du livreur</th>
                  <th>Téléphone</th>
                  <th>Adresse & Ville</th>
                  <th>Disponibilité</th>
                  <th>Compte</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {livreurs.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.nom}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.email}</div>
                    </td>
                    <td>{d.telephone}</td>
                    <td>
                      <div>{d.adresse || "—"}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{d.ville}</div>
                    </td>
                    <td>
                      <select
                        className="form-input"
                        value={d.disponibilite}
                        onChange={(e) => handleSetDisponibilite(d, e.target.value)}
                        style={{ fontSize: 12, padding: "4px 8px", width: 140 }}
                        disabled={actionLoading === d.id + "-dispo"}
                      >
                        <option value="DISPONIBLE">🟢 DISPONIBLE</option>
                        <option value="EN_LIVRAISON">🟡 EN_LIVRAISON</option>
                        <option value="INDISPONIBLE">🔴 INDISPONIBLE</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${d.active ? "badge-success" : "badge-danger"}`}>
                        {d.active ? "Actif" : "Désactivé"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, padding: "3px 8px" }}
                          onClick={() =>
                            setEntityDeliveries({
                              title: `Livraisons de ${d.nom}`,
                              subtitle: `Livreur (${d.ville})`,
                              fetchFn: () => api.adminGetLivreurDeliveries(d.id),
                            })
                          }
                          title="Consulter les livraisons attribuées à ce livreur"
                        >
                          📦 Livraisons
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 11, padding: "3px 8px" }}
                          onClick={() => setEditLivreur(d)}
                        >
                          ✏️ Modifier
                        </button>
                        {d.active && (
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: 11, padding: "3px 8px" }}
                            onClick={() => handleDeactivateLivreur(d.id)}
                            disabled={actionLoading === d.id}
                          >
                            Désactiver
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Fournisseurs */}
      {tab === "fournisseurs" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Raison Sociale</th>
                  <th>Responsable</th>
                  <th>Téléphone</th>
                  <th>Ville & Adresse</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fournisseurs.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{f.raisonSociale}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.email}</div>
                    </td>
                    <td>{f.responsable}</td>
                    <td>{f.telephone}</td>
                    <td>
                      <div>{f.ville}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.adresse || "—"}</div>
                    </td>
                    <td>
                      <span className={`badge ${f.active ? "badge-success" : "badge-danger"}`}>
                        {f.active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, padding: "3px 8px" }}
                          onClick={() =>
                            setEntityDeliveries({
                              title: `Expéditions de ${f.raisonSociale}`,
                              subtitle: `Fournisseur (${f.ville})`,
                              fetchFn: () => api.adminGetFournisseurDeliveries(f.id),
                            })
                          }
                          title="Consulter les livraisons créées par ce fournisseur"
                        >
                          📦 Livraisons
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 11, padding: "3px 8px" }}
                          onClick={() => setEditFournisseur(f)}
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          className={`btn ${f.active ? "btn-danger" : "btn-success"} btn-sm`}
                          style={{ fontSize: 11, padding: "3px 8px" }}
                          onClick={() => handleToggleFournisseur(f)}
                          disabled={actionLoading === f.id}
                        >
                          {f.active ? "Désactiver" : "Activer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Journal d'Audit (Section 18) */}
      {tab === "audit" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
              🛡️ Journalisation des opérations importantes (Section 18)
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Traçabilité complète des actions : connexions, créations de livraisons, affectations, et changements de mot de passe.
            </div>
          </div>

          {!auditLogs || auditLogs.content.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-state-icon">🛡️</div>
              <div className="empty-state-title">Aucun log enregistré</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Entité</th>
                    <th>Utilisateur</th>
                    <th>Détails de l'opération</th>
                    <th>Date & Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.content.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: "rgba(99, 102, 241, 0.15)",
                            color: "var(--brand-500)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            fontFamily: "monospace",
                            fontSize: 11,
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{log.entityType || "—"}</div>
                        {log.entityId && (
                          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" }}>
                            {log.entityId.substring(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td>
                        {log.user ? (
                          <div>
                            <div style={{ fontSize: 12, color: "var(--text-primary)" }}>{log.user.email}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{log.user.role}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Système / Anonyme</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {log.details || "—"}
                      </td>
                      <td style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 20px",
                  borderTop: "1px solid var(--border)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                <div>
                  Page {auditLogs.number + 1} sur {auditLogs.totalPages} ({auditLogs.totalElements} événements)
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={auditLogs.number === 0}
                    onClick={() => setAuditPage((p) => Math.max(0, p - 1))}
                  >
                    ← Précédent
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={auditLogs.number >= auditLogs.totalPages - 1}
                    onClick={() => setAuditPage((p) => p + 1)}
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {detailTarget && (
        <DeliveryDetailModal
          livraisonId={detailTarget.id}
          fetchDetail={(id) => api.adminGetDeliveryDetail(id)}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {historyTarget && (
        <StatusHistoryModal
          livraison={historyTarget}
          fetchHistory={() => api.adminGetHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}

      {entityDeliveries && (
        <EntityDeliveriesModal
          title={entityDeliveries.title}
          subtitle={entityDeliveries.subtitle}
          fetchDeliveries={entityDeliveries.fetchFn}
          onSelectDelivery={(l) => {
            setEntityDeliveries(null);
            setDetailTarget(l);
          }}
          onClose={() => setEntityDeliveries(null)}
        />
      )}

      {showCreateLivreur && (
        <CreateLivreurModal
          onClose={() => setShowCreateLivreur(false)}
          onSuccess={() => {
            setShowCreateLivreur(false);
            loadData();
          }}
        />
      )}

      {assignTarget && (
        <AssignModal
          livraison={assignTarget}
          livreurs={livreurs}
          onClose={() => setAssignTarget(null)}
          onSuccess={() => {
            setAssignTarget(null);
            loadData();
          }}
        />
      )}

      {editLivreur && (
        <EditLivreurModal
          livreur={editLivreur}
          onClose={() => setEditLivreur(null)}
          onSuccess={() => {
            setEditLivreur(null);
            loadData();
          }}
        />
      )}

      {editFournisseur && (
        <EditFournisseurModal
          fournisseur={editFournisseur}
          onClose={() => setEditFournisseur(null)}
          onSuccess={() => {
            setEditFournisseur(null);
            loadData();
          }}
        />
      )}
    </Layout>
  );
}