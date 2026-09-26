// src/components/Layout.tsx
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import NotificationBell from "./NotificationBell";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  topbarRight?: ReactNode;
  role: "ADMIN" | "FOURNISSEUR" | "LIVREUR";
}

const roleConfig = {
  ADMIN: {
    label: "Administrateur",
    icon: "👑",
    color: "#6366f1",
    bg: "/admin",
  },
  FOURNISSEUR: {
    label: "Fournisseur",
    icon: "🏭",
    color: "#10b981",
    bg: "/fournisseur",
  },
  LIVREUR: {
    label: "Livreur",
    icon: "🛵",
    color: "#f59e0b",
    bg: "/livreur",
  },
};

export default function Layout({ children, title, subtitle, navItems, topbarRight, role }: LayoutProps) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const cfg = roleConfig[role];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = auth.role?.charAt(0) ?? "U";

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🚚</div>
          <div>
            <div className="sidebar-logo-text">DeliverPro</div>
            <div className="sidebar-logo-sub">Gestion livraisons</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item${item.active ? " active" : ""}`}
              onClick={item.onClick}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Role badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              background: cfg.color + "18",
              border: `1px solid ${cfg.color}40`,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>{cfg.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Connecté</div>
            </div>
          </div>

          <button
            id="btn-logout"
            className="btn btn-ghost w-full"
            style={{ fontSize: 13 }}
            onClick={handleLogout}
          >
            <span>↩</span> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
            {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
          </div>
          <div className="topbar-right">
            {topbarRight}
            <NotificationBell />
            <div className="avatar">{initials}</div>
          </div>
        </header>

        {/* Content */}
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
