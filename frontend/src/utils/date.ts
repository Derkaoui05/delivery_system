// src/utils/date.ts

export function formatDate(str: string | null | undefined): string {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("fr-FR");
  } catch {
    return str;
  }
}

export function formatDateTime(str: string | null | undefined): string {
  if (!str) return "—";
  try {
    const d = new Date(str);
    return `${d.toLocaleDateString("fr-FR")} à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return str;
  }
}
