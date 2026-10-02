// src/api/client.ts

const BASE_URL = "http://localhost:8080/api";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Erreur ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}
