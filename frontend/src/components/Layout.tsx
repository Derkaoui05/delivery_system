// src/components/Layout.tsx
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import ChangePasswordModal from "./ChangePasswordModal";

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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
            <div className="sidebar-logo-sub">Gestion logistique</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu Principal</div>
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Session active
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost w-full"
            style={{ fontSize: 12, marginBottom: 6, justifyContent: "flex-start" }}
            onClick={() => setShowChangePassword(true)}
          >
            <span>🔒</span> Mot de passe
          </button>

          <button
            id="btn-logout"
            className="btn btn-ghost w-full"
            style={{ fontSize: 12, justifyContent: "flex-start", color: "var(--red)" }}
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
          <div className="topbar-right" style={{ position: "relative" }}>
            {topbarRight}
            <NotificationBell />

            <div style={{ position: "relative" }}>
              <div
                className="avatar"
                style={{ cursor: "pointer" }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                title="Options profil"
              >
                {initials}
              </div>

              {showUserMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: 8,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-lg)",
                    minWidth: 180,
                    zIndex: 100,
                    padding: 6,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: "flex-start", fontSize: 12 }}
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowChangePassword(true);
                    }}
                  >
                    🔒 Changer mot de passe
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: "flex-start", fontSize: 12, color: "var(--red)" }}
                    onClick={handleLogout}
                  >
                    ↩ Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="page-content">{children}</div>
      </main>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}
