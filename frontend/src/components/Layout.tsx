// src/components/Layout.tsx
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Shield,
  Building2,
  Bike,
  KeyRound,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import ChangePasswordModal from "./ChangePasswordModal";

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
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
    icon: Shield,
    color: "var(--brand-400)",
    bg: "var(--brand-surface)",
    border: "rgba(99, 102, 241, 0.32)",
  },
  FOURNISSEUR: {
    label: "Fournisseur",
    icon: Building2,
    color: "var(--emerald-400)",
    bg: "var(--emerald-surface)",
    border: "rgba(16, 185, 129, 0.32)",
  },
  LIVREUR: {
    label: "Livreur",
    icon: Bike,
    color: "var(--amber-400)",
    bg: "var(--amber-surface)",
    border: "rgba(245, 158, 11, 0.32)",
  },
};

export default function Layout({ children, title, subtitle, navItems, topbarRight, role }: LayoutProps) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const cfg = roleConfig[role];
  const RoleIcon = cfg.icon;
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
          <div className="sidebar-logo-icon">
            <Truck size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="sidebar-logo-text">SwiftLog</div>
            <div className="sidebar-logo-sub">Enterprise Delivery</div>
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
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Active Role card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
            }}
          >
            <RoleIcon size={18} strokeWidth={2} style={{ color: cfg.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Session sécurisée
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost w-full"
            style={{ fontSize: 12.5, justifyContent: "flex-start", gap: 9 }}
            onClick={() => setShowChangePassword(true)}
          >
            <KeyRound size={14} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
            <span>Mot de passe</span>
          </button>

          <button
            id="btn-logout"
            className="btn btn-ghost w-full"
            style={{ fontSize: 12.5, justifyContent: "flex-start", color: "var(--rose-400)", gap: 9 }}
            onClick={handleLogout}
          >
            <LogOut size={14} strokeWidth={2} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main">
        {/* Sticky Translucent Topbar */}
        <header className="topbar">
          <div>
            <h1 className="topbar-title">{title}</h1>
            {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
          </div>

          <div className="topbar-right">
            {topbarRight}
            <NotificationBell />

            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                }}
                title="Options profil"
                aria-label="Options profil"
              >
                <div className="avatar">
                  {initials}
                </div>
                <ChevronDown size={14} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
              </button>

              {showUserMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 10px)",
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-lg), 0 0 0 1px rgba(255,255,255,0.05)",
                    minWidth: 200,
                    zIndex: 100,
                    padding: 6,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    animation: "modalScaleUp var(--dur-fast) var(--ease-spring)",
                  }}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: "flex-start", fontSize: 12.5, gap: 8 }}
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowChangePassword(true);
                    }}
                  >
                    <KeyRound size={14} strokeWidth={2} />
                    <span>Changer mot de passe</span>
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: "flex-start", fontSize: 12.5, color: "var(--rose-400)", gap: 8 }}
                    onClick={handleLogout}
                  >
                    <LogOut size={14} strokeWidth={2} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Route View */}
        <div className="page-content">{children}</div>
      </main>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}
