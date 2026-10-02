// src/components/livreur/StatusProgress.tsx
import { getStatusMeta } from "../../utils/statusHelpers";

const STATUS_STEPS = ["AFFECTEE", "COLIS_RECUPERE", "EN_LIVRAISON", "LIVREE"];

export default function StatusProgress({ status }: { status: string }) {
  const idx = STATUS_STEPS.indexOf(status);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 12 }}>
      {STATUS_STEPS.map((step, i) => {
        const done = i <= idx;
        const current = i === idx;
        const meta = getStatusMeta(step);
        return (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < STATUS_STEPS.length - 1 ? 1 : undefined,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  background: done
                    ? current
                      ? "var(--brand-500)"
                      : "var(--emerald)"
                    : "var(--surface-3)",
                  border: `2px solid ${
                    done
                      ? current
                        ? "var(--brand-500)"
                        : "var(--emerald)"
                      : "var(--border)"
                  }`,
                  boxShadow: current ? "0 0 10px var(--brand-glow)" : "none",
                  transition: "all 300ms",
                }}
              >
                {done ? (current ? "●" : "✓") : "○"}
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: done ? "var(--text-secondary)" : "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {meta.label.split(" ")[0]}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: i < idx ? "var(--emerald)" : "var(--border)",
                  margin: "0 4px",
                  marginBottom: 16,
                  transition: "background 300ms",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
