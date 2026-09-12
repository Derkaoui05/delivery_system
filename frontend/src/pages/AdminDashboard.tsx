// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminDashboard() {
  const [livraisons, setLivraisons] = useState<any[]>([]);
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [selectedLivreur, setSelectedLivreur] = useState<{ [id: string]: string }>({});

  const load = async () => {
    setLivraisons(await api.adminSearchLivraisons());
    setLivreurs(await api.listLivreurs());
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Dashboard Admin</h2>
      <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th>Référence</th><th>Statut</th><th>Fournisseur</th><th>Livreur</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {livraisons.map((l) => (
            <tr key={l.id}>
              <td>{l.reference}</td>
              <td>{l.statut}</td>
              <td>{l.fournisseurNom}</td>
              <td>{l.livreurNom || "—"}</td>
              <td>
                {l.statut === "EN_ATTENTE" && (
                  <button onClick={async () => { await api.validate(l.id); load(); }}>Valider</button>
                )}
                {l.statut === "VALIDEE" && (
                  <>
                    <select onChange={(e) => setSelectedLivreur({ ...selectedLivreur, [l.id]: e.target.value })}>
                      <option value="">Choisir livreur</option>
                      {livreurs.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
                    </select>
                    <button onClick={async () => { await api.assign(l.id, selectedLivreur[l.id]); load(); }}>Affecter</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}