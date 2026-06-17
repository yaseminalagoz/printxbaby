import { remainingDaysLabel, urgencyLevel } from "@/lib/dates";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  gecikti: "bg-danger-400 text-white",
  kritik: "bg-danger-100 text-danger-600",
  yaklasiyor: "bg-amber-100 text-amber-600",
  normal: "bg-black/5 text-ink/60",
};

export function DeliveryCountdownBadge({ deliveryDate }: { deliveryDate: string }) {
  const level = urgencyLevel(deliveryDate);
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", TONE[level])}>
      {remainingDaysLabel(deliveryDate)}
    </span>
  );
}
