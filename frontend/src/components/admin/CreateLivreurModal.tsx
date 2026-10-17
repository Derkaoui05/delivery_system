// src/components/admin/CreateLivreurModal.tsx
import { useState } from "react";
import { UserPlus, X, AlertCircle } from "lucide-react";
import { api } from "../../api";
import type { RegisterLivreurRequest } from "../../types";

interface CreateLivreurModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateLivreurModal({ onClose, onSuccess }: CreateLivreurModalProps) {
  const [form, setForm] = useState<RegisterLivreurRequest>({
    email: "",
    password: "",
    nom: "",
    telephone: "",
    adresse: "",
    ville: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof RegisterLivreurRequest, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createLivreur(form);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du compte livreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-sm)",
                background: "var(--brand-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--brand-400)",
              }}
            >
              <UserPlus size={18} strokeWidth={2} />
            </div>
            <h3 className="modal-title">Créer un profil livreur</h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fermer">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nom complet *</label>
              <input
                className="form-input"
                placeholder="Ex. Youssef El Amrani"
                value={form.nom}
                onChange={(e) => set("nom", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
              <input
                className="form-input"
                placeholder="0612345678"
                value={form.telephone}
                onChange={(e) => set("telephone", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Adresse e-mail professionnelle *</label>
            <input
              className="form-input"
              type="email"
              placeholder="youssef@livraison.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe initial (min. 8 car.) *</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••••••"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Adresse de base</label>
              <input
                className="form-input"
                placeholder="Rue, quartier..."
                value={form.adresse}
                onChange={(e) => set("adresse", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ville de rattachement *</label>
              <input
                className="form-input"
                placeholder="Ex. Casablanca"
                value={form.ville}
                onChange={(e) => set("ville", e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={15} strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: 6 }}>
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} strokeWidth={2} />
                  <span>Enregistrer le livreur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
