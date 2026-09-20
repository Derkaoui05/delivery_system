// src/pages/AdminDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import Layout from "../components/Layout";
import { getStatusMeta, ALL_STATUTS } from "../utils/statusHelpers";

type Livraison = {
  id: string;
  reference: string;
  status: string;
  fournisseurNom: string;
  livreurNom: string | null;
  clientNom: string;
  clientVille: string;
  descriptionColis: string;
  createdAt: string;
};

type Livreur = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  disponibilite: string;
};

type Tab = "livraisons" | "livreurs";

// ── Create Livreur Modal ────────────────────────────────────────────
function CreateLivreurModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createLivreur(form);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">➕ Créer un livreur</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input className="form-input" placeholder="Dupont" value={form.nom} onChange={(e) => set("nom", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input className="form-input" placeholder="Jean" value={form.prenom} onChange={(e) => set("prenom", e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="form-input" type="email" placeholder="jean@livraison.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => set("password", e.target.value)} required />
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Créer le livreur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Assign Modal ─────────────────────────────────────────────────────
function AssignModal({ livraison, livreurs, onClose, onSuccess }: {
  livraison: Livraison;
  livreurs: Livreur[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [livreurId, setLivreurId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!livreurId) { setError("Veuillez sélectionner un livreur"); return; }
    setLoading(true);
    try {
      await api.assign(livraison.id, livreurId);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📋 Affecter un livreur</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="card card-sm" style={{ marginBottom: 16, background: "var(--surface-3)" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Livraison</div>
          <div style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>{livraison.reference}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            {livraison.clientNom} — {livraison.clientVille}
          </div>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Livreur disponible</label>
            <select className="form-select" value={livreurId} onChange={(e) => setLivreurId(e.target.value)} required>
              <option value="">— Sélectionner —</option>
              {livreurs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.prenom} {l.nom} ({l.disponibilite})
                </option>
              ))}
            </select>
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !livreurId}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Affecter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("livraisons");
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterVille, setFilterVille] = useState("");
  const [search, setSearch] = useState("");
  const [showCreateLivreur, setShowCreateLivreur] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Livraison | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [l, d] = await Promise.all([api.adminSearchLivraisons(), api.listLivreurs()]);
      setLivraisons(l || []);
      setLivreurs(d || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleValidate = async (id: string) => {
    setActionLoading(id);
    try { await api.validate(id); await load(); } finally { setActionLoading(null); }
  };

  // Stats
  const stats = {
    total: livraisons.length,
    enAttente: livraisons.filter((l) => l.status === "EN_ATTENTE").length,
    enCours: livraisons.filter((l) => ["AFFECTEE", "COLIS_RECUPERE", "EN_LIVRAISON"].includes(l.status)).length,
    livrees: livraisons.filter((l) => l.status === "LIVREE").length,
    livreurs: livreurs.length,
  };

  // Filtered livraisons
  const filtered = livraisons.filter((l) => {
    const matchStatus = !filterStatus || l.status === filterStatus;
    const matchVille = !filterVille || l.clientVille?.toLowerCase().includes(filterVille.toLowerCase());
    const matchSearch = !search || l.reference?.toLowerCase().includes(search.toLowerCase()) || l.clientNom?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchVille && matchSearch;
  });

  const navItems = [
    { id: "livraisons", label: "Livraisons", icon: "📦", active: tab === "livraisons", onClick: () => setTab("livraisons") },
    { id: "livreurs", label: "Livreurs", icon: "🛵", active: tab === "livreurs", onClick: () => setTab("livreurs") },
  ];

  return (
    <Layout
      role="ADMIN"
      title="Dashboard Admin"
      subtitle="Gestion des livraisons et des livreurs"
      navItems={navItems}
      topbarRight={
        <button id="btn-add-livreur" className="btn btn-primary btn-sm" onClick={() => setShowCreateLivreur(true)}>
          + Livreur
        </button>
      }
    >
      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: "Total livraisons", value: stats.total, icon: "📦", color: "var(--brand-500)" },
          { label: "En attente", value: stats.enAttente, icon: "⏳", color: "var(--amber)" },
          { label: "En cours", value: stats.enCours, icon: "🚚", color: "var(--sky)" },
          { label: "Livrées", value: stats.livrees, icon: "✅", color: "var(--emerald)" },
          { label: "Livreurs", value: stats.livreurs, icon: "🛵", color: "#a78bfa" },
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

      {/* Livraisons Tab */}
      {tab === "livraisons" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <div className="section-header" style={{ marginBottom: 14 }}>
              <div>
                <div className="section-title">Toutes les livraisons</div>
                <div className="section-subtitle">{filtered.length} résultat(s)</div>
              </div>
            </div>
            <div className="filter-bar">
              <div className="search-wrapper" style={{ minWidth: 220 }}>
                <span className="search-icon" style={{ fontSize: 14 }}>🔍</span>
                <input
                  className="form-input search-input"
                  placeholder="Référence, client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="form-select" style={{ width: 180 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Tous les statuts</option>
                {ALL_STATUTS.map((s) => (
                  <option key={s} value={s}>{getStatusMeta(s).label}</option>
                ))}
              </select>
              <input
                className="form-input"
                style={{ width: 160 }}
                placeholder="Filtrer par ville"
                value={filterVille}
                onChange={(e) => setFilterVille(e.target.value)}
              />
              <button className="btn btn-ghost btn-sm" onClick={load}>↻ Actualiser</button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ width: 32, height: 32, borderTopColor: "var(--brand-500)" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-title">Aucune livraison trouvée</div>
              <div className="text-sm">Modifiez vos filtres ou attendez de nouvelles demandes</div>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Statut</th>
                    <th>Fournisseur</th>
                    <th>Client</th>
                    <th>Ville</th>
                    <th>Livreur</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => {
                    const meta = getStatusMeta(l.status);
                    return (
                      <tr key={l.id}>
                        <td><span className="td-primary text-mono">{l.reference}</span></td>
                        <td>
                          <span className={`badge ${meta.badgeClass}`}>
                            <span className="badge-dot" />
                            {meta.label}
                          </span>
                        </td>
                        <td>{l.fournisseurNom || "—"}</td>
                        <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{l.clientNom}</td>
                        <td>{l.clientVille}</td>
                        <td>{l.livreurNom || <span className="text-muted">Non affecté</span>}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {l.status === "EN_ATTENTE" && (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleValidate(l.id)}
                                disabled={actionLoading === l.id}
                              >
                                {actionLoading === l.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : "✓ Valider"}
                              </button>
                            )}
                            {l.status === "VALIDEE" && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setAssignTarget(l)}
                              >
                                ↗ Affecter
                              </button>
                            )}
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

      {/* Livreurs Tab */}
      {tab === "livreurs" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <div className="section-header" style={{ marginBottom: 0 }}>
              <div>
                <div className="section-title">Équipe de livreurs</div>
                <div className="section-subtitle">{livreurs.length} livreur(s) enregistré(s)</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreateLivreur(true)}>
                + Nouveau livreur
              </button>
            </div>
          </div>

          {livreurs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛵</div>
              <div className="empty-title">Aucun livreur</div>
              <div className="text-sm">Créez votre premier livreur</div>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Livreur</th>
                    <th>E-mail</th>
                    <th>Disponibilité</th>
                  </tr>
                </thead>
                <tbody>
                  {livreurs.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                            {(l.prenom?.[0] ?? "?")}
                          </div>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                            {l.prenom} {l.nom}
                          </span>
                        </div>
                      </td>
                      <td>{l.email}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: l.disponibilite === "DISPONIBLE" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                            color: l.disponibilite === "DISPONIBLE" ? "var(--emerald)" : "var(--amber)",
                            border: `1px solid ${l.disponibilite === "DISPONIBLE" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                          }}
                        >
                          <span className="badge-dot" />
                          {l.disponibilite === "DISPONIBLE" ? "Disponible" : "Occupé"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateLivreur && (
        <CreateLivreurModal onClose={() => setShowCreateLivreur(false)} onSuccess={load} />
      )}
      {assignTarget && (
        <AssignModal
          livraison={assignTarget}
          livreurs={livreurs}
          onClose={() => setAssignTarget(null)}
          onSuccess={load}
        />
      )}
    </Layout>
  );
}