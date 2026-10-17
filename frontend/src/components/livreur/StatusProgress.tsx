// src/components/livreur/StatusProgress.tsx
import { Check, CircleDot, Circle } from "lucide-react";
import { getStatusMeta } from "../../utils/statusHelpers";

const STATUS_STEPS = ["AFFECTEE", "COLIS_RECUPERE", "EN_LIVRAISON", "LIVREE"];

export default function StatusProgress({ status }: { status: string }) {
  const idx = STATUS_STEPS.indexOf(status);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 14 }}>
      {STATUS_STEPS.map((step, i) => {
        const done = i < idx;
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: done
                    ? "var(--emerald-500)"
                    : current
                    ? "var(--brand-500)"
                    : "var(--surface-3)",
                  border: `2px solid ${
                    done
                      ? "var(--emerald-500)"
                      : current
                      ? "var(--brand-500)"
                      : "var(--border)"
                  }`,
                  color: "#fff",
                  boxShadow: current ? "0 0 12px var(--brand-glow)" : "none",
                  transition: "all var(--dur-base) var(--ease-smooth)",
                }}
              >
                {done ? (
                  <Check size={13} strokeWidth={2.4} />
                ) : current ? (
                  <CircleDot size={13} strokeWidth={2.4} />
                ) : (
                  <Circle size={8} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
                )}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: current ? 700 : 500,
                  color: current
                    ? "var(--text-primary)"
                    : done
                    ? "var(--emerald-400)"
                    : "var(--text-muted)",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.01em",
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
                  background: i < idx ? "var(--emerald-500)" : "var(--border)",
                  margin: "0 6px",
                  marginBottom: 18,
                  transition: "background var(--dur-base) var(--ease-smooth)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
