// src/pages/FournisseurDashboard.tsx
import { useEffect, useState } from "react";
import { api } from "../api";

export default function FournisseurDashboard() {
  const [livraisons, setLivraisons] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    descriptionColis: "", nombreColis: 1, clientNom: "", clientTelephone: "", clientAdresse: "", clientVille: "",
  });

  const load = async () => {
    try {
      const data = await api.myLivraisonsFournisseur();
      setLivraisons(data || []);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement des livraisons");
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.createLivraison(form);
      setForm({ descriptionColis: "", nombreColis: 1, clientNom: "", clientTelephone: "", clientAdresse: "", clientVille: "" });
      load();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la livraison");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Espace Fournisseur</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input placeholder="Description colis" value={form.descriptionColis} onChange={(e) => setForm({ ...form, descriptionColis: e.target.value })} required /><br />
        <input placeholder="Nom client" value={form.clientNom} onChange={(e) => setForm({ ...form, clientNom: e.target.value })} required /><br />
        <input placeholder="Téléphone client" value={form.clientTelephone} onChange={(e) => setForm({ ...form, clientTelephone: e.target.value })} required /><br />
        <input placeholder="Adresse client" value={form.clientAdresse} onChange={(e) => setForm({ ...form, clientAdresse: e.target.value })} required /><br />
        <input placeholder="Ville client" value={form.clientVille} onChange={(e) => setForm({ ...form, clientVille: e.target.value })} required /><br />
        <button type="submit" style={{ marginTop: 8 }}>Créer la demande</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {livraisons.map((l) => <li key={l.id}>{l.reference} — {l.statut}</li>)}
      </ul>
    </div>
  );
}