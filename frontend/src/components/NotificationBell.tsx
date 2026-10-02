import { useEffect, useState, useRef } from "react";
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
    const id = setInterval(load, 30000); // poll every 30s
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
        style={{ position: "relative", fontSize: 18 }}
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4, right: -4,
              background: "var(--red)",
              color: "#fff",
              borderRadius: "999px",
              fontSize: 10,
              fontWeight: 700,
              minWidth: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              boxShadow: "0 0 6px var(--red-glow)",
              animation: "pulse 2s infinite",
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
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 200,
            overflow: "hidden",
            animation: "slideUp 150ms var(--ease)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
              🔔 Notifications {unread > 0 && <span style={{ color: "var(--brand-500)", fontSize: 12 }}>({unread} non lues)</span>}
            </div>
            {unread > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11 }}
                onClick={markAll}
              >
                Tout lire
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔕</div>
                Aucune notification
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: n.read ? "transparent" : "rgba(99,102,241,0.06)",
                    cursor: n.read ? "default" : "pointer",
                    transition: "background 150ms",
                  }}
                >
                  <div
                    style={{
                      width: 8, height: 8,
                      borderRadius: "50%",
                      background: n.read ? "var(--border)" : "var(--brand-500)",
                      flexShrink: 0,
                      marginTop: 6,
                      boxShadow: n.read ? "none" : "0 0 6px var(--brand-glow)",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {n.livraison?.reference && (
                      <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--brand-500)", marginBottom: 2 }}>
                        {n.livraison.reference}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: n.read ? "var(--text-secondary)" : "var(--text-primary)", lineHeight: 1.4 }}>
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
