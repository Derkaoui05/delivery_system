// src/components/common/StatusBadge.tsx
import { getStatusMeta } from "../../utils/statusHelpers";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const meta = getStatusMeta(status);
  return (
    <span className={`badge ${meta.badgeClass} ${className}`.trim()}>
      <span style={{ display: "inline-flex", alignItems: "center" }}>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}
