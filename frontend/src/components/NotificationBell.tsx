import { useEffect, useState, useRef } from "react";
import { Bell, BellOff, CheckCheck, CircleDot } from "lucide-react";
import { api } from "../api";
import type { Notification } from "../types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const data = await api.getNotifications();
      setNotifs(data || []);
    } catch {}
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifs.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const markAll = async () => {
    const unreadOnes = notifs.filter((n) => !n.read);
    await Promise.allSettled(unreadOnes.map((n) => api.markNotificationRead(n.id)));
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        id="btn-notifications"
        className="btn btn-ghost btn-icon"
        onClick={() => setOpen((o) => !o)}
        style={{ position: "relative" }}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={1.8} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              background: "var(--rose-500)",
              color: "#fff",
              borderRadius: "var(--radius-full)",
              fontSize: 10,
              fontWeight: 700,
              minWidth: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              boxShadow: "0 0 8px var(--rose-glow)",
              animation: "pulse 2.2s infinite",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: 360,
            background: "var(--surface-1)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg), 0 0 0 1px rgba(255,255,255,0.04)",
            zIndex: 200,
            overflow: "hidden",
            animation: "modalScaleUp var(--dur-base) var(--ease-spring)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface-2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "var(--text-primary)", fontSize: 13.5 }}>
              <Bell size={15} strokeWidth={2} style={{ color: "var(--brand-400)" }} />
              <span>Notifications</span>
              {unread > 0 && (
                <span style={{ color: "var(--brand-400)", fontSize: 12, fontWeight: 600 }}>({unread})</span>
              )}
            </div>
            {unread > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11, padding: "3px 8px", gap: 4 }}
                onClick={markAll}
              >
                <CheckCheck size={13} strokeWidth={2} />
                <span>Tout marquer lu</span>
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                <BellOff size={28} strokeWidth={1.6} style={{ margin: "0 auto 10px", color: "var(--text-dim)", display: "block" }} />
                <span>Aucune notification pour le moment</span>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "13px 18px",
                    borderBottom: "1px solid var(--border)",
                    background: n.read ? "transparent" : "rgba(99, 102, 241, 0.05)",
                    cursor: n.read ? "default" : "pointer",
                    transition: "background var(--dur-fast) var(--ease-smooth)",
                  }}
                >
                  <div style={{ marginTop: 3, flexShrink: 0 }}>
                    <CircleDot
                      size={12}
                      strokeWidth={2.4}
                      style={{
                        color: n.read ? "var(--text-dim)" : "var(--brand-400)",
                        filter: n.read ? "none" : "drop-shadow(0 0 4px var(--brand-glow))",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {n.livraison?.reference && (
                      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--brand-400)", marginBottom: 2, fontWeight: 600 }}>
                        {n.livraison.reference}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: n.read ? "var(--text-secondary)" : "var(--text-primary)", lineHeight: 1.45 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
