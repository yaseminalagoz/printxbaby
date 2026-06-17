import {
  DELIVERY_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PRODUCTION_STATUS_LABELS,
  type DeliveryType,
  type PaymentStatus,
  type ProductionStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<ProductionStatus, string> = {
  tasarim_bekliyor: "bg-amber-100 text-amber-600",
  tasarim_onay_bekliyor: "bg-amber-100 text-amber-600",
  baski_sirasinda: "bg-brand-50 text-brand-700",
  baski_tamamlandi: "bg-brand-100 text-brand-700",
  montaj_asamasinda: "bg-blush-100 text-blush-500",
  hazir: "bg-mint-100 text-mint-600",
  kargoya_verildi: "bg-mint-100 text-mint-600",
  teslim_edildi: "bg-black/5 text-ink/60",
};

export function ProductionStatusBadge({ status }: { status: ProductionStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", STATUS_TONE[status])}>
      {PRODUCTION_STATUS_LABELS[status]}
    </span>
  );
}

const DELIVERY_TONE: Record<DeliveryType, string> = {
  normal: "bg-black/5 text-ink/60",
  acil: "bg-amber-100 text-amber-600",
  hizli_kargo: "bg-danger-100 text-danger-600",
};

export function DeliveryTypeBadge({ type }: { type: DeliveryType }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", DELIVERY_TONE[type])}>
      {DELIVERY_TYPE_LABELS[type]}
    </span>
  );
}

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  odenmedi: "bg-danger-100 text-danger-600",
  kapora_alindi: "bg-amber-100 text-amber-600",
  tamamlandi: "bg-mint-100 text-mint-600",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", PAYMENT_TONE[status])}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
