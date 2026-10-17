// src/pages/FournisseurDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import {
  Package,
  PlusCircle,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Eye,
  History,
  MapPin,
  Calendar,
  Send,
  AlertCircle,
  Inbox,
  Filter,
} from "lucide-react";
import { api } from "../api";
import Layout, { type NavItem } from "../components/Layout";
import StatusHistoryModal from "../components/StatusHistoryModal";
import DeliveryDetailModal from "../components/DeliveryDetailModal";
import { getStatusMeta, ALL_STATUTS } from "../utils/statusHelpers";
import type { Livraison, FournisseurDashboardStats } from "../types";
import { formatDate } from "../utils/date";

type FormData = {
  descriptionColis: string;
  nombreColis: number;
  poidsApprox: string;
  instructions: string;
  clientNom: string;
  clientTelephone: string;
  clientAdresse: string;
  clientVille: string;
  instructionsLivraison: string;
  dateSouhaiteeRecuperation: string;
  dateSouhaiteeLivraison: string;
  commentaire: string;
};

const defaultForm: FormData = {
  descriptionColis: "",
  nombreColis: 1,
  poidsApprox: "",
  instructions: "",
  clientNom: "",
  clientTelephone: "",
  clientAdresse: "",
  clientVille: "Casablanca",
  instructionsLivraison: "",
  dateSouhaiteeRecuperation: "",
  dateSouhaiteeLivraison: "",
  commentaire: "",
};

type Tab = "livraisons" | "nouvelle";

export default function FournisseurDashboard() {
  const [tab, setTab] = useState<Tab>("livraisons");
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [dashboardStats, setDashboardStats] = useState<FournisseurDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [historyTarget, setHistoryTarget] = useState<Livraison | null>(null);
  const [detailTarget, setDetailTarget] = useState<Livraison | null>(null);

  // Search & filter state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const set = (k: keyof FormData, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listData, statsData] = await Promise.allSettled([
        api.myLivraisonsFournisseur(),
        api.getFournisseurDashboard(),
      ]);

      if (listData.status === "fulfilled") {
        setLivraisons(listData.value || []);
      }
      if (statsData.status === "fulfilled") {
        setDashboardStats(statsData.value);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await api.createLivraison({
        ...form,
        poidsApprox: form.poidsApprox ? parseFloat(form.poidsApprox) : null,
        dateSouhaiteeRecuperation: form.dateSouhaiteeRecuperation || null,
        dateSouhaiteeLivraison: form.dateSouhaiteeLivraison || null,
      });
      setSuccess("Demande d'expédition enregistrée avec succès !");
      setForm(defaultForm);
      await load();
      setTimeout(() => setTab("livraisons"), 1200);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la livraison");
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const stats = {
    total: dashboardStats?.totalLivraisons ?? livraisons.length,
    enAttente: dashboardStats?.enAttente ?? livraisons.filter((l) => l.status === "EN_ATTENTE").length,
    enCours: dashboardStats?.enCours ?? livraisons.filter((l) => !["EN_ATTENTE", "LIVREE", "ECHEC_LIVRAISON"].includes(l.status)).length,
    livrees: dashboardStats?.livrees ?? livraisons.filter((l) => l.status === "LIVREE").length,
    echouees: dashboardStats?.echouees ?? livraisons.filter((l) => l.status === "ECHEC_LIVRAISON").length,
  };

  // Filtered deliveries
  const filteredLivraisons = livraisons.filter((l) => {
    const matchSearch =
      !search ||
      l.reference.toLowerCase().includes(search.toLowerCase()) ||
      l.clientNom.toLowerCase().includes(search.toLowerCase()) ||
      l.clientVille.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const navItems: NavItem[] = [
    {
      id: "livraisons",
      label: "Mes expéditions",
      icon: <Package size={17} strokeWidth={1.8} />,
      active: tab === "livraisons",
      onClick: () => setTab("livraisons"),
    },
    {
      id: "nouvelle",
      label: "Nouvelle demande",
      icon: <PlusCircle size={17} strokeWidth={1.8} />,
      active: tab === "nouvelle",
      onClick: () => setTab("nouvelle"),
    },
  ];

  return (
    <Layout
      role="FOURNISSEUR"
      title="Espace Fournisseur"
      subtitle="Gestion et suivi en temps réel de votre flux d'expéditions"
      navItems={navItems}
      topbarRight={
        <button className="btn btn-primary btn-sm" onClick={() => setTab("nouvelle")}>
          <PlusCircle size={14} strokeWidth={2} />
          <span>Nouvelle expédition</span>
        </button>
      }
    >
      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { label: "Total expéditions", value: stats.total, icon: Package, color: "var(--brand-400)" },
          { label: "En attente", value: stats.enAttente, icon: Clock, color: "var(--amber-400)" },
          { label: "En cours d'acheminement", value: stats.enCours, icon: Truck, color: "var(--sky-400)" },
          { label: "Colis livrés", value: stats.livrees, icon: CheckCircle2, color: "var(--emerald-400)" },
          { label: "Échecs signalés", value: stats.echouees, icon: AlertTriangle, color: "var(--rose-400)" },
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

      {/* Mes Livraisons Tab */}
      {tab === "livraisons" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Filter Bar */}
          <div
            style={{
              padding: "16px 22px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--surface-2)",
            }}
          >
            <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 280 }}>
              <div className="search-wrapper">
                <div className="search-icon">
                  <Search size={15} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder="Rechercher par réf, destinataire ou ville..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div style={{ position: "relative", minWidth: 190 }}>
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  {ALL_STATUTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
              <Filter size={13} strokeWidth={2} />
              <span>{filteredLivraisons.length} colis répertorié(s)</span>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
              <div className="spinner" style={{ margin: "0 auto 14px", width: 22, height: 22 }} />
              <p style={{ fontSize: 13 }}>Synchronisation des expéditions en cours...</p>
            </div>
          ) : filteredLivraisons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Inbox size={42} strokeWidth={1.5} />
              </div>
              <div className="empty-title">Aucune expédition trouvée</div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 360, marginBottom: 18 }}>
                {search || filterStatus
                  ? "Aucun résultat ne correspond aux filtres appliqués."
                  : "Vous n'avez pas encore créé de demande de livraison."}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setTab("nouvelle")}
              >
                <PlusCircle size={15} strokeWidth={2} />
                <span>Créer une première expédition</span>
              </button>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Statut</th>
                    <th>Destinataire</th>
                    <th>Destination</th>
                    <th>Colis</th>
                    <th>Livreur assigné</th>
                    <th>Date souhaitée</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLivraisons.map((l) => {
                    const meta = getStatusMeta(l.status);
                    return (
                      <tr key={l.id}>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm td-primary"
                            onClick={() => setDetailTarget(l)}
                            title="Consulter le dossier de livraison"
                            style={{ gap: 6 }}
                          >
                            <span>{l.reference}</span>
                            <Eye size={12} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
                          </button>
                        </td>
                        <td>
                          <span className={`badge ${meta.badgeClass}`}>
                            <span className="badge-dot" />
                            {meta.label}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{l.clientNom}</td>
                        <td>{l.clientVille}</td>
                        <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {l.descriptionColis}
                        </td>
                        <td>
                          {l.livreurNom ? (
                            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{l.livreurNom}</span>
                          ) : (
                            <span style={{ color: "var(--text-dim)", fontSize: 12 }}>Non assigné</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12.5 }}>{formatDate(l.dateSouhaiteeLivraison)}</td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDetailTarget(l)}
                              title="Détails complets"
                            >
                              <Eye size={13} strokeWidth={1.8} />
                              <span>Détails</span>
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setHistoryTarget(l)}
                              title="Historique des étapes"
                            >
                              <History size={13} strokeWidth={1.8} />
                              <span>Timeline</span>
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

      {/* Nouvelle Livraison Form Tab */}
      {tab === "nouvelle" && (
        <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="section-header" style={{ marginBottom: 24 }}>
            <div>
              <h2 className="section-title" style={{ fontSize: 18 }}>Création d'une nouvelle expédition</h2>
              <p className="section-subtitle">Détails logistiques du colis et coordonnées du point de chute</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            {/* Section: Colis */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "var(--brand-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
                <Package size={15} strokeWidth={2} />
                <span>Description & Caractéristiques du colis</span>
              </div>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Description du contenu *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. Équipement électronique, pièces détachées, documents..."
                    value={form.descriptionColis}
                    onChange={(e) => set("descriptionColis", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre de colis</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={form.nombreColis}
                    onChange={(e) => set("nombreColis", parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Poids approximatif (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="Ex. 3.5"
                    value={form.poidsApprox}
                    onChange={(e) => set("poidsApprox", e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Instructions d'enlèvement (Point A)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. Quai numéro 3, demander le responsable d'entrepôt"
                    value={form.instructions}
                    onChange={(e) => set("instructions", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Section: Destinataire (Client) */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "var(--emerald-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
                <MapPin size={15} strokeWidth={2} />
                <span>Destinataire & Point de chute (Point B)</span>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nom complet du destinataire *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. Mehdi Bennani"
                    value={form.clientNom}
                    onChange={(e) => set("clientNom", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Numéro de téléphone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Ex. 0612345678"
                    value={form.clientTelephone}
                    onChange={(e) => set("clientTelephone", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse de livraison détaillée *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. 42 Boulevard d'Anfa, Immeuble A, 4ème étage"
                    value={form.clientAdresse}
                    onChange={(e) => set("clientAdresse", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ville de destination *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. Casablanca, Rabat, Tanger..."
                    value={form.clientVille}
                    onChange={(e) => set("clientVille", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Instructions spécifiques au livreur</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. Digicode 1984, appeler à l'arrivée"
                    value={form.instructionsLivraison}
                    onChange={(e) => set("instructionsLivraison", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Section: Planning & Notes */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "var(--sky-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
                <Calendar size={15} strokeWidth={2} />
                <span>Dates prévisionnelles & Notes</span>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Date souhaitée de récupération</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.dateSouhaiteeRecuperation}
                    onChange={(e) => set("dateSouhaiteeRecuperation", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date souhaitée de livraison</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.dateSouhaiteeLivraison}
                    onChange={(e) => set("dateSouhaiteeLivraison", e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Commentaire additionnel</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Remarques éventuelles sur la manipulation ou la priorité..."
                    value={form.commentaire}
                    onChange={(e) => set("commentaire", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={16} strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success">
                <CheckCircle2 size={16} strokeWidth={2} />
                <span>{success}</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setTab("livraisons")}
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
                style={{ gap: 8 }}
              >
                {submitting ? (
                  <>
                    <span className="spinner" />
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} strokeWidth={2} />
                    <span>Confirmer la demande</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modals */}
      {detailTarget && (
        <DeliveryDetailModal
          livraisonId={detailTarget.id}
          fetchDetail={(id) => api.getDeliveryDetail(id)}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {historyTarget && (
        <StatusHistoryModal
          livraison={historyTarget}
          fetchHistory={() => api.fournisseurGetHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </Layout>
  );
}