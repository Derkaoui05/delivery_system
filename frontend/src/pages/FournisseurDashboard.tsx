// src/pages/FournisseurDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import Layout from "../components/Layout";
import StatusHistoryModal from "../components/StatusHistoryModal";
import { getStatusMeta } from "../utils/statusHelpers";

type Livraison = {
  id: string;
  reference: string;
  status: string;
  clientNom: string;
  clientVille: string;
  descriptionColis: string;
  livreurNom: string | null;
  dateSouhaiteeRecuperation: string | null;
  dateSouhaiteeLivraison: string | null;
  createdAt: string;
};

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
  clientVille: "",
  instructionsLivraison: "",
  dateSouhaiteeRecuperation: "",
  dateSouhaiteeLivraison: "",
  commentaire: "",
};

type Tab = "livraisons" | "nouvelle";

function formatDate(str: string | null) {
  if (!str) return "—";
  try { return new Date(str).toLocaleDateString("fr-FR"); } catch { return str; }
}

export default function FournisseurDashboard() {
  const [tab, setTab] = useState<Tab>("livraisons");
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [historyTarget, setHistoryTarget] = useState<Livraison | null>(null);

  const set = (k: keyof FormData, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.myLivraisonsFournisseur();
      setLivraisons(data || []);
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

  // Stats
  const stats = {
    total: livraisons.length,
    enCours: livraisons.filter((l) => !["LIVREE", "ECHEC_LIVRAISON"].includes(l.status)).length,
    livrees: livraisons.filter((l) => l.status === "LIVREE").length,
    echecs: livraisons.filter((l) => l.status === "ECHEC_LIVRAISON").length,
  };

  const navItems = [
    { id: "livraisons", label: "Mes livraisons", icon: "📦", active: tab === "livraisons", onClick: () => setTab("livraisons") },
    { id: "nouvelle", label: "Nouvelle demande", icon: "➕", active: tab === "nouvelle", onClick: () => setTab("nouvelle") },
  ];

  return (
    <Layout
      role="FOURNISSEUR"
      title="Espace Fournisseur"
      subtitle="Gérez vos demandes de livraison"
      navItems={navItems}
      topbarRight={
        <button className="btn btn-primary btn-sm" onClick={() => setTab("nouvelle")}>
          + Nouvelle livraison
        </button>
      }
    >
      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "Total envois", value: stats.total, icon: "📦", color: "var(--emerald)" },
          { label: "En cours", value: stats.enCours, icon: "🚚", color: "var(--sky)" },
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

      {/* Mes Livraisons */}
      {tab === "livraisons" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <div className="section-header" style={{ marginBottom: 0 }}>
              <div>
                <div className="section-title">Mes livraisons</div>
                <div className="section-subtitle">{livraisons.length} demande(s) enregistrée(s)</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={load}>↻ Actualiser</button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ width: 32, height: 32, borderTopColor: "var(--emerald)" }} />
            </div>
          ) : livraisons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">Aucune livraison pour le moment</div>
              <div className="text-sm" style={{ marginBottom: 16 }}>Créez votre première demande de livraison</div>
              <button className="btn btn-primary" onClick={() => setTab("nouvelle")}>
                + Créer une demande
              </button>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Statut</th>
                    <th>Client</th>
                    <th>Ville</th>
                    <th>Colis</th>
                    <th>Livreur</th>
                    <th>Livraison souhaitée</th>
                    <th>Historique</th>
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
                            style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 8px" }}
                            onClick={() => setHistoryTarget(l)}
                            title="Voir l'historique"
                          >
                            {l.reference} 📋
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
                        <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {l.descriptionColis}
                        </td>
                        <td>{l.livreurNom || <span className="text-muted">—</span>}</td>
                        <td>{formatDate(l.dateSouhaiteeLivraison)}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: 11 }}
                            onClick={() => setHistoryTarget(l)}
                          >
                            📋 Voir
                          </button>
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

      {/* Nouvelle Livraison Form */}
      {tab === "nouvelle" && (
        <div className="card">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <div>
              <div className="section-title">📦 Nouvelle demande de livraison</div>
              <div className="section-subtitle">Remplissez tous les champs obligatoires (*)</div>
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
                  <label className="form-label">Description du colis *</label>
                  <input
                    className="form-input"
                    placeholder="Ex: Vêtements, électronique, documents..."
                    value={form.descriptionColis}
                    onChange={(e) => set("descriptionColis", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre de colis *</label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={form.nombreColis}
                    onChange={(e) => set("nombreColis", parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Poids approx. (kg)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.1"
                    min={0}
                    placeholder="Ex: 2.5"
                    value={form.poidsApprox}
                    onChange={(e) => set("poidsApprox", e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Instructions de manipulation</label>
                  <input
                    className="form-input"
                    placeholder="Ex: Fragile, ne pas retourner..."
                    value={form.instructions}
                    onChange={(e) => set("instructions", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="divider" style={{ margin: 0 }} />

            {/* Section: Client */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--emerald)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                👤 Informations client
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nom du client *</label>
                  <input
                    className="form-input"
                    placeholder="Nom complet"
                    value={form.clientNom}
                    onChange={(e) => set("clientNom", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone *</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={form.clientTelephone}
                    onChange={(e) => set("clientTelephone", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Adresse *</label>
                  <input
                    className="form-input"
                    placeholder="Numéro, rue, appartement..."
                    value={form.clientAdresse}
                    onChange={(e) => set("clientAdresse", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ville *</label>
                  <input
                    className="form-input"
                    placeholder="Ex: Casablanca"
                    value={form.clientVille}
                    onChange={(e) => set("clientVille", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Instructions de livraison</label>
                  <input
                    className="form-input"
                    placeholder="Ex: Laisser à la gardienne..."
                    value={form.instructionsLivraison}
                    onChange={(e) => set("instructionsLivraison", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="divider" style={{ margin: 0 }} />

            {/* Section: Dates */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sky)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                📅 Dates souhaitées
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Date de récupération souhaitée</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.dateSouhaiteeRecuperation}
                    onChange={(e) => set("dateSouhaiteeRecuperation", e.target.value)}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date de livraison souhaitée</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.dateSouhaiteeLivraison}
                    onChange={(e) => set("dateSouhaiteeLivraison", e.target.value)}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Commentaire</label>
                  <input
                    className="form-input"
                    placeholder="Remarques supplémentaires..."
                    value={form.commentaire}
                    onChange={(e) => set("commentaire", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && <div className="alert alert-error">⚠ {error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setForm(defaultForm); setError(""); setSuccess(""); }}
              >
                Réinitialiser
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? (
                  <><span className="spinner" style={{ width: 16, height: 16 }} /> Envoi...</>
                ) : (
                  "Créer la demande →"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      {historyTarget && (
        <StatusHistoryModal
          reference={historyTarget.reference}
          fetchHistory={() => api.fournisseurGetHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </Layout>
  );
}