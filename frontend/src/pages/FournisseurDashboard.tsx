// src/pages/FournisseurDashboard.tsx
import { useEffect, useState } from "react";
import { api } from "../api";

export default function FournisseurDashboard() {
  const [livraisons, setLivraisons] = useState<any[]>([]);
  const [form, setForm] = useState({
    descriptionColis: "", nombreColis: 1, clientNom: "", clientTelephone: "", clientAdresse: "", clientVille: "",
  });

  const load = async () => setLivraisons(await api.myLivraisonsFournisseur());
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createLivraison(form);
    load();
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Espace Fournisseur</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input placeholder="Description colis" onChange={(e) => setForm({ ...form, descriptionColis: e.target.value })} /><br />
        <input placeholder="Nom client" onChange={(e) => setForm({ ...form, clientNom: e.target.value })} /><br />
        <input placeholder="Téléphone client" onChange={(e) => setForm({ ...form, clientTelephone: e.target.value })} /><br />
        <input placeholder="Adresse client" onChange={(e) => setForm({ ...form, clientAdresse: e.target.value })} /><br />
        <input placeholder="Ville client" onChange={(e) => setForm({ ...form, clientVille: e.target.value })} /><br />
        <button type="submit">Créer la demande</button>
      </form>

      <ul>
        {livraisons.map((l) => <li key={l.id}>{l.reference} — {l.statut}</li>)}
      </ul>
    </div>
  );
}