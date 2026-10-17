// src/components/DeliveryDetailModal.tsx
import { useEffect, useState } from "react";
import {
  Package,
  X,
  Flag,
  Phone,
  Copy,
  Check,
  Calendar,
  Bike,
  Building2,
  FileText,
  History,
  AlertTriangle,
  AlertCircle,
  Scale,
  Layers,
} from "lucide-react";
import type { LivraisonDetail, StatusHistory } from "../types";
import { getStatusMeta } from "../utils/statusHelpers";
import { formatDate } from "../utils/date";

interface DeliveryDetailModalProps {
  livraisonId: string;
  fetchDetail: (id: string) => Promise<LivraisonDetail>;
  onClose: () => void;
}

export default function DeliveryDetailModal({ livraisonId, fetchDetail, onClose }: DeliveryDetailModalProps) {
  const [data, setData] = useState<LivraisonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchDetail(livraisonId)
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Erreur de chargement des détails");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [livraisonId, fetchDetail]);

  const copyPhone = (phone?: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const meta = data ? getStatusMeta(data.status) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 720, width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface-2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--radius-sm)",
                background: "var(--brand-surface)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--brand-400)",
              }}
            >
              <Package size={20} strokeWidth={2} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                  {data?.reference || "Dossier d'expédition"}
                </h3>
                {meta && (
                  <span className={`badge ${meta.badgeClass}`}>
                    <span style={{ display: "inline-flex" }}>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </span>
                )}
              </div>
              {data?.createdAt && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                  Créée le {formatDate(data.createdAt)}
                </div>
              )}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Fermer">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
              <div className="spinner" style={{ margin: "0 auto 12px", width: 24, height: 24 }} />
              <p style={{ fontSize: 13 }}>Chargement des données logistiques...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} strokeWidth={2} />
              <div>{error}</div>
            </div>
          )}

          {data && (
            <>
              {/* Route: Point A to Point B */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18,
                  background: "var(--surface-2)",
                  padding: 18,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Point A */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "var(--brand-400)", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    <Building2 size={14} strokeWidth={2} />
                    <span>Point A (Expéditeur)</span>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
                    {data.fournisseurNom || "Fournisseur"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    {data.fournisseurAdresse || "Adresse non renseignée"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {data.fournisseurVille || "Ville non précisée"}
                  </div>
                  {data.fournisseurTelephone && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() => copyPhone(data.fournisseurTelephone)}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11.5, padding: "4px 9px", gap: 6 }}
                      >
                        <Phone size={11} strokeWidth={2} />
                        <span>{data.fournisseurTelephone}</span>
                        {copiedPhone === data.fournisseurTelephone ? (
                          <Check size={11} strokeWidth={2.5} style={{ color: "var(--emerald-400)" }} />
                        ) : (
                          <Copy size={11} strokeWidth={2} style={{ color: "var(--text-dim)" }} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Point B */}
                <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "var(--emerald-400)", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    <Flag size={14} strokeWidth={2} />
                    <span>Point B (Destinataire)</span>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
                    {data.clientNom || "Destinataire"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    {data.clientAdresse || "Adresse client"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {data.clientVille || "Ville client"}
                  </div>
                  {data.clientTelephone && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() => copyPhone(data.clientTelephone)}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11.5, padding: "4px 9px", gap: 6 }}
                      >
                        <Phone size={11} strokeWidth={2} />
                        <span>{data.clientTelephone}</span>
                        {copiedPhone === data.clientTelephone ? (
                          <Check size={11} strokeWidth={2.5} style={{ color: "var(--emerald-400)" }} />
                        ) : (
                          <Copy size={11} strokeWidth={2} style={{ color: "var(--text-dim)" }} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Colis characteristics */}
              <div
                style={{
                  background: "var(--surface-2)",
                  padding: 18,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, fontSize: 13.5 }}>
                  <Package size={15} strokeWidth={2} style={{ color: "var(--brand-400)" }} />
                  <span>Spécifications du Colis</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
                  <div style={{ background: "var(--surface-1)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                      <FileText size={12} strokeWidth={1.8} />
                      <span>Description</span>
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 4, fontSize: 13 }}>
                      {data.descriptionColis || "Colis standard"}
                    </div>
                  </div>
                  <div style={{ background: "var(--surface-1)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                      <Layers size={12} strokeWidth={1.8} />
                      <span>Quantité</span>
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 4, fontSize: 13 }}>
                      {data.nombreColis ?? 1} colis
                    </div>
                  </div>
                  <div style={{ background: "var(--surface-1)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                      <Scale size={12} strokeWidth={1.8} />
                      <span>Poids estimé</span>
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 4, fontSize: 13 }}>
                      {data.poidsApprox ? `${data.poidsApprox} kg` : "Non précisé"}
                    </div>
                  </div>
                </div>

                {/* Instructions & Comments */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
                  {data.instructions && (
                    <div style={{ background: "var(--surface-1)", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Instructions de récupération : </span>
                      <span style={{ color: "var(--text-primary)" }}>{data.instructions}</span>
                    </div>
                  )}
                  {data.instructionsLivraison && (
                    <div style={{ background: "var(--surface-1)", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Consignes de livraison : </span>
                      <span style={{ color: "var(--text-primary)" }}>{data.instructionsLivraison}</span>
                    </div>
                  )}
                  {data.commentaire && (
                    <div style={{ background: "var(--surface-1)", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Notes additionnelles : </span>
                      <span style={{ color: "var(--text-primary)" }}>{data.commentaire}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Planning & Livreur Assigned */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* Dates */}
                <div
                  style={{
                    background: "var(--surface-2)",
                    padding: 16,
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10, fontSize: 13 }}>
                    <Calendar size={14} strokeWidth={2} style={{ color: "var(--sky-400)" }} />
                    <span>Planning prévisionnel</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Enlèvement souhaité :{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {data.dateSouhaiteeRecuperation || "Dès que possible"}
                    </strong>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                    Livraison souhaitée :{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {data.dateSouhaiteeLivraison || "Dès que possible"}
                    </strong>
                  </div>
                </div>

                {/* Livreur */}
                <div
                  style={{
                    background: "var(--surface-2)",
                    padding: 16,
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10, fontSize: 13 }}>
                    <Bike size={14} strokeWidth={2} style={{ color: "var(--amber-400)" }} />
                    <span>Transporteur assigné</span>
                  </div>
                  {data.livreurNom ? (
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13.5 }}>{data.livreurNom}</div>
                      {data.livreurTelephone && (
                        <div style={{ marginTop: 6 }}>
                          <button
                            type="button"
                            onClick={() => copyPhone(data.livreurTelephone)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "3px 8px", fontSize: 11.5, gap: 5 }}
                          >
                            <Phone size={11} strokeWidth={2} />
                            <span>{data.livreurTelephone}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: "var(--text-muted)", fontSize: 12.5 }}>Aucun livreur actuellement assigné</div>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              {data.statusHistory && data.statusHistory.length > 0 && (
                <div
                  style={{
                    background: "var(--surface-2)",
                    padding: 18,
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, fontSize: 13.5 }}>
                    <History size={14} strokeWidth={2} style={{ color: "var(--brand-400)" }} />
                    <span>Historique chronologique des transitions</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {data.statusHistory.map((h: StatusHistory, idx: number) => {
                      const stepMeta = getStatusMeta(h.statut);
                      return (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            paddingBottom: idx < data.statusHistory!.length - 1 ? 12 : 0,
                            borderBottom:
                              idx < data.statusHistory!.length - 1 ? "1px solid var(--border)" : "none",
                          }}
                        >
                          <span
                            className={`badge ${stepMeta.badgeClass}`}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              padding: 0,
                            }}
                          >
                            {stepMeta.icon}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>
                                {stepMeta.label}
                              </span>
                              <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                                {formatDate(h.changeAt)}
                              </span>
                            </div>
                            {h.motifEchec && (
                              <div
                                style={{
                                  marginTop: 6,
                                  fontSize: 12,
                                  color: "var(--rose-400)",
                                  background: "var(--rose-surface)",
                                  border: "1px solid rgba(244, 63, 94, 0.3)",
                                  padding: "5px 10px",
                                  borderRadius: "var(--radius-xs)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <AlertTriangle size={13} strokeWidth={2} />
                                <span>Motif d'échec : {h.motifEchec}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "flex-end",
            background: "var(--surface-2)",
          }}
        >
          <button className="btn btn-ghost" onClick={onClose}>
            Fermer le dossier
          </button>
        </div>
      </div>
    </div>
  );
}
