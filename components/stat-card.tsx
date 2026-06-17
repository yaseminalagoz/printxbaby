import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "brand" | "mint" | "amber" | "danger" | "blush";
  hint?: string;
}) {
  const toneClasses: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    mint: "bg-mint-100 text-mint-600",
    amber: "bg-amber-100 text-amber-600",
    danger: "bg-danger-100 text-danger-600",
    blush: "bg-blush-100 text-blush-500",
  };

  return (
    <div className="card flex items-start gap-3 p-4">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneClasses[tone])}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="mt-0.5 truncate text-xl font-semibold text-ink">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}
