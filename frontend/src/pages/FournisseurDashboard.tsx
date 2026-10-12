// src/pages/FournisseurDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import Layout from "../components/Layout";
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
      setSuccess("✅ Demande de livraison créée avec succès !");
      setForm(defaultForm);
      await load();
      setTimeout(() => setTab("livraisons"), 1200);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création");
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

  const navItems = [
    { id: "livraisons", label: "Mes livraisons", icon: "📦", active: tab === "livraisons", onClick: () => setTab("livraisons") },
    { id: "nouvelle", label: "Nouvelle demande", icon: "➕", active: tab === "nouvelle", onClick: () => setTab("nouvelle") },
  ];

  return (
    <Layout
      role="FOURNISSEUR"
      title="Espace Fournisseur"
      subtitle="Gérez et suivez l'ensemble de vos expéditions en temps réel"
      navItems={navItems}
      topbarRight={
        <button className="btn btn-primary btn-sm" onClick={() => setTab("nouvelle")}>
          + Nouvelle livraison
        </button>
      }
    >
      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { label: "Total envois", value: stats.total, icon: "📦", color: "var(--brand-500)" },
          { label: "En attente", value: stats.enAttente, icon: "⏳", color: "var(--amber)" },
          { label: "En cours", value: stats.enCours, icon: "🚚", color: "var(--sky)" },
          { label: "Livrées", value: stats.livrees, icon: "✅", color: "var(--emerald)" },
          { label: "Échecs", value: stats.echouees, icon: "❌", color: "var(--red)" },
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

      {/* Mes Livraisons Tab */}
      {tab === "livraisons" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Filter Bar */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 260 }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Rechercher par réf, client ou ville..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: 13, padding: "8px 12px" }}
              />
              <select
                className="form-input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: 170, fontSize: 13 }}
              >
                <option value="">Tous les statuts</option>
                {ALL_STATUTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {filteredLivraisons.length} expédition(s) trouvée(s)
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />
              Chargement de vos expéditions...
            </div>
          ) : filteredLivraisons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">Aucune livraison trouvée</div>
              <div className="empty-state-sub">
                {search || filterStatus
                  ? "Aucun résultat ne correspond à vos filtres."
                  : "Créez votre première demande de livraison en quelques clics !"}
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 14 }}
                onClick={() => setTab("nouvelle")}
              >
                Créer une livraison
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Statut</th>
                    <th>Client (Destinataire)</th>
                    <th>Ville</th>
                    <th>Colis</th>
                    <th>Livreur</th>
                    <th>Date souhaitée</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLivraisons.map((l) => {
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
                        <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{l.clientNom}</td>
                        <td>{l.clientVille}</td>
                        <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {l.descriptionColis}
                        </td>
                        <td>{l.livreurNom || <span className="text-muted">— Non assigné</span>}</td>
                        <td>{formatDate(l.dateSouhaiteeLivraison)}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11, padding: "3px 8px" }}
                              onClick={() => setDetailTarget(l)}
                            >
                              👁 Détails
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: 11, padding: "3px 8px" }}
                              onClick={() => setHistoryTarget(l)}
                            >
                              🕒 Timeline
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
        <div className="card">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <div>
              <div className="section-title">📦 Nouvelle demande d'expédition</div>
              <div className="section-subtitle">Renseignez les détails du colis et l'adresse de destination</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Section: Colis */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-500)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                📦 Informations colis
              </div>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Description du contenu *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. Électronique fragile, documents légaux, vêtements..."
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
                    placeholder="Ex. 2.5"
                    value={form.poidsApprox}
                    onChange={(e) => set("poidsApprox", e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Instructions de récupération (Point A)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. Se présenter à l'accueil, demander M. Tazi au 2ème étage"
                    value={form.instructions}
                    onChange={(e) => set("instructions", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Section: Destinataire (Client) */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--emerald)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                🏁 Destinataire (Client / Point B)
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nom complet du client *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. Fatima Zahra Alami"
                    value={form.clientNom}
                    onChange={(e) => set("clientNom", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone client *</label>
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
                  <label className="form-label">Adresse de livraison complète *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. Résidence Les Fleurs, Appt 12, Quartier Bourgogne"
                    value={form.clientAdresse}
                    onChange={(e) => set("clientAdresse", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ville de livraison *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. Casablanca, Rabat, Marrakech..."
                    value={form.clientVille}
                    onChange={(e) => set("clientVille", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Instructions de livraison (Point B)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex. Code porte 2458B, sonner à l'interphone"
                    value={form.instructionsLivraison}
                    onChange={(e) => set("instructionsLivraison", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Section: Planning & Notes */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sky)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                📅 Planning & Remarques
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
                    className="form-input"
                    rows={2}
                    placeholder="Remarques particulières pour le transporteur..."
                    value={form.commentaire}
                    onChange={(e) => set("commentaire", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>⚠</span> {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success">
                <span>✓</span> {success}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setTab("livraisons")}
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
              >
                {submitting ? "Création en cours..." : "Confirmer la demande 🚀"}
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