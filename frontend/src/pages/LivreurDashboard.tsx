// src/pages/LivreurDashboard.tsx
import { useEffect, useState } from "react";
import { api } from "../api";

const NEXT_STATUS: Record<string, string> = {
  AFFECTEE: "COLIS_RECUPERE",
  COLIS_RECUPERE: "EN_LIVRAISON",
  EN_LIVRAISON: "LIVREE",
};

export default function LivreurDashboard() {
  const [livraisons, setLivraisons] = useState<any[]>([]);
  const load = async () => setLivraisons(await api.myLivraisonsLivreur());
  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Mes missions</h2>
      <ul>
        {livraisons.map((l) => (
          <li key={l.id} style={{ marginBottom: 8 }}>
            {l.reference} — {l.statut}{" "}
            {NEXT_STATUS[l.statut] && (
              <button onClick={async () => { await api.updateStatus(l.id, NEXT_STATUS[l.statut]); load(); }}>
                → {NEXT_STATUS[l.statut]}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}