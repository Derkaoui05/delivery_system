// src/pages/AdminDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Bike,
  Building2,
  ShieldCheck,
  RotateCw,
  UserPlus,
  Clock,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  X,
  Eye,
  History,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ShieldAlert,
  Check,
  UserCheck,
} from "lucide-react";
import { api } from "../api";
import Layout, { type NavItem } from "../components/Layout";
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

  const navItems: NavItem[] = [
    {
      id: "livraisons",
      label: "Toutes les expéditions",
      icon: <Package size={17} strokeWidth={1.8} />,
      active: tab === "livraisons",
      onClick: () => setTab("livraisons"),
    },
    {
      id: "livreurs",
      label: "Gestion Livreurs",
      icon: <Bike size={17} strokeWidth={1.8} />,
      active: tab === "livreurs",
      onClick: () => setTab("livreurs"),
    },
    {
      id: "fournisseurs",
      label: "Gestion Fournisseurs",
      icon: <Building2 size={17} strokeWidth={1.8} />,
      active: tab === "fournisseurs",
      onClick: () => setTab("fournisseurs"),
    },
    {
      id: "audit",
      label: "Journal d'Audit & Sécurité",
      icon: <ShieldAlert size={17} strokeWidth={1.8} />,
      active: tab === "audit",
      onClick: () => setTab("audit"),
    },
  ];

  return (
    <Layout
      role="ADMIN"
      title="Centre d'Administration"
      subtitle="Supervision du réseau logistique, affectations et conformité"
      navItems={navItems}
      topbarRight={
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={loadData} style={{ gap: 6 }}>
            <RotateCw size={13} strokeWidth={2} className={loading ? "spinner" : ""} />
            <span>Actualiser</span>
          </button>
          {tab === "livreurs" && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateLivreur(true)} style={{ gap: 6 }}>
              <UserPlus size={14} strokeWidth={2} />
              <span>Nouveau Livreur</span>
            </button>
          )}
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { label: "Total Expéditions", value: stats.total, icon: Package, color: "var(--brand-400)" },
          { label: "En Attente de validation", value: stats.enAttente, icon: Clock, color: "var(--amber-400)" },
          { label: "Validées / Affectées", value: stats.validees + stats.affectees, icon: ClipboardCheck, color: "var(--sky-400)" },
          { label: "Colis livrés", value: stats.livrees, icon: CheckCircle2, color: "var(--emerald-400)" },
          { label: "Échecs déclarés", value: stats.echecs, icon: AlertTriangle, color: "var(--rose-400)" },
          { label: "Livreurs Disponibles", value: `${stats.dispoLivreurs} / ${stats.totalLivreurs}`, icon: Bike, color: "var(--purple-400)" },
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

      {/* Tab: Livraisons */}
      {tab === "livraisons" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Advanced Search & Filter Bar */}
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface-2)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                <SlidersHorizontal size={15} strokeWidth={2} style={{ color: "var(--brand-400)" }} />
                <span>Filtres de recherche multicritères</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11.5, padding: "3px 9px", gap: 5 }}
                onClick={resetFilters}
              >
                <X size={12} strokeWidth={2} />
                <span>Réinitialiser les filtres</span>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              <div className="search-wrapper">
                <div className="search-icon">
                  <Search size={13} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder="Réf. (ex. LIV-)"
                  value={filterReference}
                  onChange={(e) => setFilterReference(e.target.value)}
                  style={{ fontSize: 12.5 }}
                />
              </div>

              <input
                type="text"
                className="form-input"
                placeholder="Ville (ex. Casablanca)"
                value={filterVille}
                onChange={(e) => setFilterVille(e.target.value)}
                style={{ fontSize: 12.5 }}
              />

              <select
                className="form-select"
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                style={{ fontSize: 12.5 }}
              >
                <option value="">Tous les statuts</option>
                {ALL_STATUTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                className="form-select"
                value={filterFournisseurId}
                onChange={(e) => setFilterFournisseurId(e.target.value)}
                style={{ fontSize: 12.5 }}
              >
                <option value="">Tous les fournisseurs</option>
                {fournisseurs.map((f) => (
                  <option key={f.id} value={f.id}>{f.raisonSociale}</option>
                ))}
              </select>

              <select
                className="form-select"
                value={filterLivreurId}
                onChange={(e) => setFilterLivreurId(e.target.value)}
                style={{ fontSize: 12.5 }}
              >
                <option value="">Tous les livreurs</option>
                {livreurs.map((d) => (
                  <option key={d.id} value={d.id}>{d.nom}</option>
                ))}
              </select>

              <input
                type="text"
                className="form-input"
                placeholder="Nom / Tél destinataire"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                style={{ fontSize: 12.5 }}
              />

              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="date"
                  className="form-input"
                  title="Date début"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  style={{ fontSize: 11.5, padding: "6px" }}
                />
                <input
                  type="date"
                  className="form-input"
                  title="Date fin"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  style={{ fontSize: 11.5, padding: "6px" }}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
              <div className="spinner" style={{ margin: "0 auto 12px", width: 22, height: 22 }} />
              <p style={{ fontSize: 13 }}>Recherche et agrégation des expéditions...</p>
            </div>
          ) : livraisons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Inbox size={42} strokeWidth={1.5} />
              </div>
              <div className="empty-title">Aucune expédition correspondante</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 360 }}>
                Modifiez vos critères de recherche ou réinitialisez les filtres.
              </p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Statut</th>
                    <th>Expéditeur (Point A)</th>
                    <th>Destinataire (Point B)</th>
                    <th>Ville</th>
                    <th>Livreur</th>
                    <th>Créée le</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {livraisons.map((l) => {
                    const meta = getStatusMeta(l.status);
                    return (
                      <tr key={l.id}>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm td-primary"
                            onClick={() => setDetailTarget(l)}
                            title="Consulter le dossier"
                            style={{ gap: 6 }}
                          >
                            <span>{l.reference}</span>
                            <Eye size={12} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
                          </button>
                        </td>
                        <td>
                          <span className={`badge ${meta.badgeClass}`}>
                            <span style={{ display: "inline-flex" }}>{meta.icon}</span>
                            <span>{meta.label}</span>
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{l.fournisseurNom || "—"}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{l.clientNom}</div>
                          {l.clientTelephone && (
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{l.clientTelephone}</div>
                          )}
                        </td>
                        <td>{l.clientVille}</td>
                        <td>
                          {l.livreurNom ? (
                            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{l.livreurNom}</span>
                          ) : (
                            <span style={{ color: "var(--amber-400)", fontSize: 12, fontWeight: 600 }}>À affecter</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12 }}>{formatDate(l.createdAt)}</td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {l.status === "EN_ATTENTE" && (
                              <button
                                className="btn btn-success btn-sm"
                                style={{ gap: 5 }}
                                onClick={() => handleValidate(l.id)}
                                disabled={actionLoading === l.id}
                              >
                                {actionLoading === l.id ? (
                                  <span className="spinner" />
                                ) : (
                                  <>
                                    <Check size={12} strokeWidth={2.4} />
                                    <span>Valider</span>
                                  </>
                                )}
                              </button>
                            )}

                            {(l.status === "VALIDEE" || l.status === "AFFECTEE") && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ gap: 5 }}
                                onClick={() => setAssignTarget(l)}
                              >
                                <UserCheck size={12} strokeWidth={2} />
                                <span>{l.livreurNom ? "Réaffecter" : "Affecter"}</span>
                              </button>
                            )}

                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDetailTarget(l)}
                              title="Détails complets Point A / Point B"
                            >
                              <Eye size={13} strokeWidth={1.8} />
                            </button>

                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setHistoryTarget(l)}
                              title="Historique des transitions"
                            >
                              <History size={13} strokeWidth={1.8} />
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
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Nom & Contact</th>
                  <th>Téléphone</th>
                  <th>Secteur / Ville</th>
                  <th>Disponibilité</th>
                  <th>Statut Compte</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {livreurs.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.nom}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{d.email}</div>
                    </td>
                    <td>{d.telephone}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{d.ville}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{d.adresse || "—"}</div>
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={d.disponibilite}
                        onChange={(e) => handleSetDisponibilite(d, e.target.value)}
                        style={{ fontSize: 12, padding: "5px 10px", width: 155 }}
                        disabled={actionLoading === d.id + "-dispo"}
                      >
                        <option value="DISPONIBLE">● DISPONIBLE</option>
                        <option value="EN_LIVRAISON">● EN_LIVRAISON</option>
                        <option value="INDISPONIBLE">● INDISPONIBLE</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${d.active ? "badge-delivered" : "badge-failed"}`}>
                        <span className="badge-dot" />
                        <span>{d.active ? "Actif" : "Désactivé"}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ gap: 5 }}
                          onClick={() =>
                            setEntityDeliveries({
                              title: `Expéditions assignées à ${d.nom}`,
                              subtitle: `Livreur (${d.ville})`,
                              fetchFn: () => api.adminGetLivreurDeliveries(d.id),
                            })
                          }
                          title="Consulter les livraisons attribuées"
                        >
                          <Package size={13} strokeWidth={1.8} />
                          <span>Livraisons</span>
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ gap: 5 }}
                          onClick={() => setEditLivreur(d)}
                        >
                          <Edit3 size={13} strokeWidth={1.8} />
                          <span>Modifier</span>
                        </button>
                        {d.active && (
                          <button
                            className="btn btn-danger btn-sm"
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
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Raison Sociale</th>
                  <th>Responsable</th>
                  <th>Téléphone</th>
                  <th>Ville & Adresse</th>
                  <th>Statut</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fournisseurs.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{f.raisonSociale}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{f.email}</div>
                    </td>
                    <td>{f.responsable}</td>
                    <td>{f.telephone}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{f.ville}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{f.adresse || "—"}</div>
                    </td>
                    <td>
                      <span className={`badge ${f.active ? "badge-delivered" : "badge-failed"}`}>
                        <span className="badge-dot" />
                        <span>{f.active ? "Actif" : "Inactif"}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ gap: 5 }}
                          onClick={() =>
                            setEntityDeliveries({
                              title: `Expéditions de ${f.raisonSociale}`,
                              subtitle: `Fournisseur (${f.ville})`,
                              fetchFn: () => api.adminGetFournisseurDeliveries(f.id),
                            })
                          }
                          title="Consulter les livraisons émises"
                        >
                          <Package size={13} strokeWidth={1.8} />
                          <span>Livraisons</span>
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ gap: 5 }}
                          onClick={() => setEditFournisseur(f)}
                        >
                          <Edit3 size={13} strokeWidth={1.8} />
                          <span>Modifier</span>
                        </button>
                        <button
                          className={`btn ${f.active ? "btn-danger" : "btn-success"} btn-sm`}
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
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>
              <ShieldCheck size={17} strokeWidth={2} style={{ color: "var(--brand-400)" }} />
              <span>Traçabilité & Journalisation des opérations sensibles (Section 18)</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>
              Audit exhaustif des accès, affectations, changements de statut et modifications de sécurité.
            </div>
          </div>

          {!auditLogs || auditLogs.content.length === 0 ? (
            <div className="empty-state" style={{ padding: 48 }}>
              <div className="empty-icon">
                <ShieldCheck size={42} strokeWidth={1.5} />
              </div>
              <div className="empty-title">Aucun événement enregistré</div>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Entité</th>
                    <th>Utilisateur</th>
                    <th>Détails de l'opération</th>
                    <th>Horodatage</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.content.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: "var(--brand-surface)",
                            color: "var(--brand-400)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{log.entityType || "—"}</div>
                        {log.entityId && (
                          <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                            {log.entityId.substring(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td>
                        {log.user ? (
                          <div>
                            <div style={{ fontSize: 12.5, color: "var(--text-primary)", fontWeight: 500 }}>{log.user.email}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{log.user.role}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Système automatique</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                        {log.details || "—"}
                      </td>
                      <td style={{ fontSize: 11.5, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
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
                  padding: "14px 22px",
                  borderTop: "1px solid var(--border)",
                  fontSize: 12.5,
                  color: "var(--text-muted)",
                  background: "var(--surface-2)",
                }}
              >
                <div>
                  Page <strong style={{ color: "var(--text-primary)" }}>{auditLogs.number + 1}</strong> sur {auditLogs.totalPages} ({auditLogs.totalElements} événements consignés)
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={auditLogs.number === 0}
                    onClick={() => setAuditPage((p) => Math.max(0, p - 1))}
                    style={{ gap: 5 }}
                  >
                    <ChevronLeft size={14} strokeWidth={2} />
                    <span>Précédent</span>
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={auditLogs.number >= auditLogs.totalPages - 1}
                    onClick={() => setAuditPage((p) => p + 1)}
                    style={{ gap: 5 }}
                  >
                    <span>Suivant</span>
                    <ChevronRight size={14} strokeWidth={2} />
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