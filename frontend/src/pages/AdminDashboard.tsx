// src/pages/AdminDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import Layout from "../components/Layout";
import StatusHistoryModal from "../components/StatusHistoryModal";
import { getStatusMeta, ALL_STATUTS } from "../utils/statusHelpers";

// ── Types ──────────────────────────────────────────────────────────────
type Livraison = {
  id: string; reference: string; status: string;
  fournisseurNom: string; livreurNom: string | null;
  clientNom: string; clientVille: string;
  descriptionColis: string; createdAt: string;
};
type Livreur = {
  id: string; email: string; nom: string;
  telephone: string; adresse: string; ville: string;
  disponibilite: string; active: boolean;
};
type Fournisseur = {
  id: string; email: string; raisonSociale: string;
  responsable: string; telephone: string;
  adresse: string; ville: string; active: boolean; createdAt: string;
};
type Tab = "livraisons" | "livreurs" | "fournisseurs";

// ── Create Livreur Modal ───────────────────────────────────────────────
function CreateLivreurModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ email: "", password: "", nom: "", telephone: "", adresse: "", ville: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await api.createLivreur(form); onSuccess(); onClose(); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
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
              <label className="form-label">Nom complet *</label>
              <input className="form-input" placeholder="Jean Dupont" value={form.nom} onChange={(e) => set("nom", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
              <input className="form-input" placeholder="06 00 00 00 00" value={form.telephone} onChange={(e) => set("telephone", e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">E-mail *</label>
            <input className="form-input" type="email" placeholder="jean@livraison.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe *</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => set("password", e.target.value)} required />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Adresse</label>
              <input className="form-input" placeholder="Rue..." value={form.adresse} onChange={(e) => set("adresse", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ville *</label>
              <input className="form-input" placeholder="Casablanca" value={form.ville} onChange={(e) => set("ville", e.target.value)} required />
            </div>
          </div>
          {error && <div className="alert alert-error">⚠ {error}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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

// ── Edit Livreur Modal ─────────────────────────────────────────────────
function EditLivreurModal({ livreur, onClose, onSuccess }: { livreur: Livreur; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ nom: livreur.nom, telephone: livreur.telephone, adresse: livreur.adresse || "", ville: livreur.ville || "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await api.adminUpdateLivreur(livreur.id, form); onSuccess(); onClose(); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">✏️ Modifier le livreur</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>{livreur.email}</div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nom complet *</label>
              <input className="form-input" value={form.nom} onChange={(e) => set("nom", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
              <input className="form-input" value={form.telephone} onChange={(e) => set("telephone", e.target.value)} required />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Adresse</label>
              <input className="form-input" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ville *</label>
              <input className="form-input" value={form.ville} onChange={(e) => set("ville", e.target.value)} required />
            </div>
          </div>
          {error && <div className="alert alert-error">⚠ {error}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Fournisseur Modal ─────────────────────────────────────────────
function EditFournisseurModal({ fournisseur, onClose, onSuccess }: { fournisseur: Fournisseur; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    raisonSociale: fournisseur.raisonSociale, responsable: fournisseur.responsable,
    telephone: fournisseur.telephone, adresse: fournisseur.adresse || "", ville: fournisseur.ville,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await api.adminUpdateFournisseur(fournisseur.id, form); onSuccess(); onClose(); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">✏️ Modifier le fournisseur</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>{fournisseur.email}</div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Raison sociale *</label>
              <input className="form-input" value={form.raisonSociale} onChange={(e) => set("raisonSociale", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Responsable *</label>
              <input className="form-input" value={form.responsable} onChange={(e) => set("responsable", e.target.value)} required />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
              <input className="form-input" value={form.telephone} onChange={(e) => set("telephone", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Ville *</label>
              <input className="form-input" value={form.ville} onChange={(e) => set("ville", e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input className="form-input" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} />
          </div>
          {error && <div className="alert alert-error">⚠ {error}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Assign Modal ───────────────────────────────────────────────────────
function AssignModal({ livraison, livreurs, onClose, onSuccess }: {
  livraison: Livraison; livreurs: Livreur[]; onClose: () => void; onSuccess: () => void;
}) {
  const [livreurId, setLivreurId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const available = livreurs.filter((l) => l.active && l.disponibilite === "DISPONIBLE");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!livreurId) { setError("Veuillez sélectionner un livreur"); return; }
    setLoading(true);
    try { await api.assign(livraison.id, livreurId); onSuccess(); onClose(); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📋 Affecter un livreur</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="card card-sm" style={{ marginBottom: 16, background: "var(--surface-3)" }}>
          <div style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>{livraison.reference}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{livraison.clientNom} — {livraison.clientVille}</div>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Livreur disponible ({available.length})</label>
            <select className="form-select" value={livreurId} onChange={(e) => setLivreurId(e.target.value)} required>
              <option value="">— Sélectionner —</option>
              {available.map((l) => (
                <option key={l.id} value={l.id}>{l.nom} — {l.ville}</option>
              ))}
            </select>
          </div>
          {available.length === 0 && <div className="alert alert-error">⚠ Aucun livreur disponible pour le moment</div>}
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

// ── Main Component ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("livraisons");
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterVille, setFilterVille] = useState("");
  const [search, setSearch] = useState("");
  const [showCreateLivreur, setShowCreateLivreur] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Livraison | null>(null);
  const [editLivreur, setEditLivreur] = useState<Livreur | null>(null);
  const [editFournisseur, setEditFournisseur] = useState<Fournisseur | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Livraison | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [l, d, f] = await Promise.all([
        api.adminSearchLivraisons(),
        api.listLivreurs(),
        api.adminListFournisseurs(),
      ]);
      setLivraisons(l || []);
      setLivreurs(d || []);
      setFournisseurs(f || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleValidate = async (id: string) => {
    setActionLoading(id);
    try { await api.validate(id); await load(); } finally { setActionLoading(null); }
  };

  const handleSetDisponibilite = async (l: Livreur, value: string) => {
    setActionLoading(l.id + "-dispo");
    try { await api.adminSetDisponibilite(l.id, value); await load(); } finally { setActionLoading(null); }
  };

  const handleDeactivateLivreur = async (id: string) => {
    if (!confirm("Désactiver ce livreur ?")) return;
    setActionLoading(id + "-deact");
    try { await api.adminDeactivateLivreur(id); await load(); } finally { setActionLoading(null); }
  };

  const handleToggleFournisseur = async (f: Fournisseur) => {
    if (!confirm(`${f.active ? "Désactiver" : "Activer"} ce fournisseur ?`)) return;
    setActionLoading(f.id);
    try {
      f.active ? await api.adminDeactivateFournisseur(f.id) : await api.adminActivateFournisseur(f.id);
      await load();
    } finally { setActionLoading(null); }
  };

  // Stats
  const stats = {
    total: livraisons.length,
    enAttente: livraisons.filter((l) => l.status === "EN_ATTENTE").length,
    enCours: livraisons.filter((l) => ["AFFECTEE", "COLIS_RECUPERE", "EN_LIVRAISON"].includes(l.status)).length,
    livrees: livraisons.filter((l) => l.status === "LIVREE").length,
    fournisseurs: fournisseurs.length,
    livreurs: livreurs.length,
  };

  const filtered = livraisons.filter((l) => {
    const matchStatus = !filterStatus || l.status === filterStatus;
    const matchVille = !filterVille || l.clientVille?.toLowerCase().includes(filterVille.toLowerCase());
    const matchSearch = !search || l.reference?.toLowerCase().includes(search.toLowerCase()) || l.clientNom?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchVille && matchSearch;
  });

  const navItems = [
    { id: "livraisons",   label: "Livraisons",   icon: "📦", active: tab === "livraisons",   onClick: () => setTab("livraisons") },
    { id: "livreurs",     label: "Livreurs",      icon: "🛵", active: tab === "livreurs",     onClick: () => setTab("livreurs") },
    { id: "fournisseurs", label: "Fournisseurs",  icon: "🏭", active: tab === "fournisseurs", onClick: () => setTab("fournisseurs") },
  ];

  return (
    <Layout
      role="ADMIN"
      title="Dashboard Admin"
      subtitle="Gestion des livraisons, livreurs et fournisseurs"
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
          { label: "En attente",       value: stats.enAttente, icon: "⏳", color: "var(--amber)" },
          { label: "En cours",         value: stats.enCours, icon: "🚚", color: "var(--sky)" },
          { label: "Livrées",          value: stats.livrees, icon: "✅", color: "var(--emerald)" },
          { label: "Fournisseurs",     value: stats.fournisseurs, icon: "🏭", color: "#f472b6" },
          { label: "Livreurs",         value: stats.livreurs, icon: "🛵", color: "#a78bfa" },
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

      {/* ── Livraisons Tab ── */}
      {tab === "livraisons" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <div className="section-header" style={{ marginBottom: 14 }}>
              <div>
                <div className="section-title">Toutes les livraisons</div>
                <div className="section-subtitle">{filtered.length} résultat(s)</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={load}>↻ Actualiser</button>
            </div>
            <div className="filter-bar">
              <div className="search-wrapper" style={{ minWidth: 220 }}>
                <span className="search-icon" style={{ fontSize: 14 }}>🔍</span>
                <input className="form-input search-input" placeholder="Référence, client..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="form-select" style={{ width: 180 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Tous les statuts</option>
                {ALL_STATUTS.map((s) => <option key={s} value={s}>{getStatusMeta(s).label}</option>)}
              </select>
              <input className="form-input" style={{ width: 160 }} placeholder="Filtrer par ville" value={filterVille} onChange={(e) => setFilterVille(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32, borderTopColor: "var(--brand-500)" }} /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-title">Aucune livraison trouvée</div>
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
                        <td><span className={`badge ${meta.badgeClass}`}><span className="badge-dot" />{meta.label}</span></td>
                        <td>{l.fournisseurNom || "—"}</td>
                        <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{l.clientNom}</td>
                        <td>{l.clientVille}</td>
                        <td>{l.livreurNom || <span className="text-muted">—</span>}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {l.status === "EN_ATTENTE" && (
                              <button className="btn btn-success btn-sm" onClick={() => handleValidate(l.id)} disabled={actionLoading === l.id}>
                                {actionLoading === l.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : "✓ Valider"}
                              </button>
                            )}
                            {l.status === "VALIDEE" && (
                              <button className="btn btn-primary btn-sm" onClick={() => setAssignTarget(l)}>↗ Affecter</button>
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

      {/* ── Livreurs Tab ── */}
      {tab === "livreurs" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <div className="section-header" style={{ marginBottom: 0 }}>
              <div>
                <div className="section-title">Équipe de livreurs</div>
                <div className="section-subtitle">{livreurs.length} livreur(s)</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreateLivreur(true)}>+ Nouveau</button>
            </div>
          </div>
          {livreurs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🛵</div><div className="empty-title">Aucun livreur</div></div>
          ) : (
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr><th>Livreur</th><th>Contact</th><th>Ville</th><th>Disponibilité</th><th>Statut</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {livreurs.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: l.active ? undefined : "var(--surface-3)" }}>
                            {l.nom?.[0] ?? "?"}
                          </div>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{l.nom}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>{l.email}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{l.telephone}</div>
                      </td>
                      <td>{l.ville || "—"}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ width: 140, padding: "4px 10px", fontSize: 12 }}
                          value={l.disponibilite}
                          disabled={actionLoading === l.id + "-dispo" || !l.active}
                          onChange={(e) => handleSetDisponibilite(l, e.target.value)}
                        >
                          <option value="DISPONIBLE">Disponible</option>
                          <option value="OCCUPE">Occupé</option>
                          <option value="INACTIF">Inactif</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${l.active ? "badge-delivered" : "badge-failed"}`}>
                          <span className="badge-dot" />{l.active ? "Actif" : "Désactivé"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditLivreur(l)} title="Modifier">✏️</button>
                          {l.active && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeactivateLivreur(l.id)}
                              disabled={actionLoading === l.id + "-deact"}
                              title="Désactiver"
                            >
                              {actionLoading === l.id + "-deact" ? <span className="spinner" style={{ width: 12, height: 12 }} /> : "🚫"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Fournisseurs Tab ── */}
      {tab === "fournisseurs" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <div className="section-header" style={{ marginBottom: 0 }}>
              <div>
                <div className="section-title">Fournisseurs</div>
                <div className="section-subtitle">{fournisseurs.length} fournisseur(s) enregistré(s)</div>
              </div>
            </div>
          </div>
          {fournisseurs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🏭</div><div className="empty-title">Aucun fournisseur</div></div>
          ) : (
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table>
                <thead>
                  <tr><th>Société</th><th>Responsable</th><th>Contact</th><th>Ville</th><th>Statut</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {fournisseurs.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{f.raisonSociale}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.email}</div>
                      </td>
                      <td>{f.responsable}</td>
                      <td>
                        <div style={{ fontSize: 12 }}>{f.telephone}</div>
                      </td>
                      <td>{f.ville}</td>
                      <td>
                        <span className={`badge ${f.active ? "badge-delivered" : "badge-failed"}`}>
                          <span className="badge-dot" />{f.active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditFournisseur(f)} title="Modifier">✏️</button>
                          <button
                            className={`btn btn-sm ${f.active ? "btn-danger" : "btn-success"}`}
                            onClick={() => handleToggleFournisseur(f)}
                            disabled={actionLoading === f.id}
                            title={f.active ? "Désactiver" : "Activer"}
                          >
                            {actionLoading === f.id
                              ? <span className="spinner" style={{ width: 12, height: 12 }} />
                              : f.active ? "🚫 Désactiver" : "✓ Activer"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showCreateLivreur && <CreateLivreurModal onClose={() => setShowCreateLivreur(false)} onSuccess={load} />}
      {assignTarget && <AssignModal livraison={assignTarget} livreurs={livreurs} onClose={() => setAssignTarget(null)} onSuccess={load} />}
      {editLivreur && <EditLivreurModal livreur={editLivreur} onClose={() => setEditLivreur(null)} onSuccess={load} />}
      {editFournisseur && <EditFournisseurModal fournisseur={editFournisseur} onClose={() => setEditFournisseur(null)} onSuccess={load} />}
      {historyTarget && (
        <StatusHistoryModal
          reference={historyTarget.reference}
          fetchHistory={() => api.adminGetHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </Layout>
  );
}