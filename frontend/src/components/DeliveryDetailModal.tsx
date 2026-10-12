// src/components/DeliveryDetailModal.tsx
import { useEffect, useState } from "react";
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
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 680, width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>📦</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {data?.reference || "Détails de la livraison"}
                </h3>
                {meta && (
                  <span className={`badge ${meta.badgeClass}`}>
                    <span className="badge-dot" />
                    {meta.icon} {meta.label}
                  </span>
                )}
              </div>
              {data?.createdAt && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  Créée le {formatDate(data.createdAt)}
                </div>
              )}
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />
              Chargement des détails...
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
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
                  gap: 16,
                  background: "var(--surface-2)",
                  padding: 16,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Point A */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ color: "#38bdf8", fontWeight: 700 }}>📍 Point A</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>(Expéditeur)</span>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
                    {data.fournisseurNom || "Fournisseur"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    {data.fournisseurAdresse || "Adresse non renseignée"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {data.fournisseurVille || "Ville non précisée"}
                  </div>
                  {data.fournisseurTelephone && (
                    <div style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => copyPhone(data.fournisseurTelephone)}
                        className="btn btn-secondary"
                        style={{ padding: "3px 8px", fontSize: 11, height: "auto" }}
                      >
                        📞 {data.fournisseurTelephone} {copiedPhone === data.fournisseurTelephone ? "✓ Copié" : ""}
                      </button>
                    </div>
                  )}
                </div>

                {/* Point B */}
                <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>🏁 Point B</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>(Destinataire)</span>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>
                    {data.clientNom || "Client"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    {data.clientAdresse || "Adresse client"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {data.clientVille || "Ville client"}
                  </div>
                  {data.clientTelephone && (
                    <div style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => copyPhone(data.clientTelephone)}
                        className="btn btn-secondary"
                        style={{ padding: "3px 8px", fontSize: 11, height: "auto" }}
                      >
                        📞 {data.clientTelephone} {copiedPhone === data.clientTelephone ? "✓ Copié" : ""}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Colis information */}
              <div
                style={{
                  background: "var(--surface-2)",
                  padding: 16,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, fontSize: 14 }}>
                  📦 Caractéristiques du Colis
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
                  <div style={{ background: "var(--surface-1)", padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Description</div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
                      {data.descriptionColis || "Colis standard"}
                    </div>
                  </div>
                  <div style={{ background: "var(--surface-1)", padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Nombre de colis</div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
                      {data.nombreColis ?? 1}
                    </div>
                  </div>
                  <div style={{ background: "var(--surface-1)", padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Poids approx.</div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
                      {data.poidsApprox ? `${data.poidsApprox} kg` : "Non précisé"}
                    </div>
                  </div>
                </div>

                {/* Instructions & Comments */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                  {data.instructions && (
                    <div style={{ background: "var(--surface-1)", padding: 10, borderRadius: 8 }}>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Instructions de récupération: </span>
                      <span style={{ color: "var(--text-primary)" }}>{data.instructions}</span>
                    </div>
                  )}
                  {data.instructionsLivraison && (
                    <div style={{ background: "var(--surface-1)", padding: 10, borderRadius: 8 }}>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Instructions de livraison: </span>
                      <span style={{ color: "var(--text-primary)" }}>{data.instructionsLivraison}</span>
                    </div>
                  )}
                  {data.commentaire && (
                    <div style={{ background: "var(--surface-1)", padding: 10, borderRadius: 8 }}>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Commentaire: </span>
                      <span style={{ color: "var(--text-primary)" }}>{data.commentaire}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Planning & Livreur Assigned */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Dates */}
                <div
                  style={{
                    background: "var(--surface-2)",
                    padding: 16,
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, fontSize: 13 }}>
                    📅 Dates souhaitées
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Récupération:{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {data.dateSouhaiteeRecuperation || "Dès que possible"}
                    </strong>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Livraison:{" "}
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
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, fontSize: 13 }}>
                    🛵 Livreur assigné
                  </div>
                  {data.livreurNom ? (
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{data.livreurNom}</div>
                      {data.livreurTelephone && (
                        <div style={{ marginTop: 6 }}>
                          <button
                            type="button"
                            onClick={() => copyPhone(data.livreurTelephone)}
                            className="btn btn-secondary"
                            style={{ padding: "2px 8px", fontSize: 11, height: "auto" }}
                          >
                            📞 {data.livreurTelephone}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucun livreur assigné</div>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              {data.statusHistory && data.statusHistory.length > 0 && (
                <div
                  style={{
                    background: "var(--surface-2)",
                    padding: 16,
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, fontSize: 14 }}>
                    🕒 Historique des étapes
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
                              idx < data.statusHistory!.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                          }}
                        >
                          <span
                            className={`badge ${stepMeta.badgeClass}`}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
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
                              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                {formatDate(h.changeAt)}
                              </span>
                            </div>
                            {h.motifEchec && (
                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: 12,
                                  color: "var(--red)",
                                  background: "rgba(239, 68, 68, 0.1)",
                                  padding: "4px 8px",
                                  borderRadius: 4,
                                }}
                              >
                                Motif: {h.motifEchec}
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
          }}
        >
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
