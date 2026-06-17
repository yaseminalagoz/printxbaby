import Link from "next/link";
import { formatDateShort } from "@/lib/dates";
import { formatTL } from "@/lib/pricing";
import { LED_LABELS, ORDER_SIZE_LABELS, type OrderWithCustomer } from "@/lib/types";
import { DeliveryCountdownBadge } from "./delivery-badge";
import { DeliveryTypeBadge, PaymentStatusBadge, ProductionStatusBadge } from "./status-badge";

export function OrderRow({ order }: { order: OrderWithCustomer }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="card flex flex-col gap-3 p-4 transition-shadow hover:shadow-card sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted">#{order.order_no}</span>
          <p className="truncate font-medium text-ink">
            {order.name}
            {order.second_name ? ` & ${order.second_name}` : ""}
          </p>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted">
          {order.customer?.full_name ?? "Müşteri silinmiş"} ·{" "}
          {ORDER_SIZE_LABELS[order.size]} · {LED_LABELS[order.led]}
        </p>
        <p className="mt-1 text-xs text-muted">
          Sipariş: {formatDateShort(order.order_date)} · Teslim: {formatDateShort(order.delivery_date)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <DeliveryTypeBadge type={order.delivery_type} />
        <ProductionStatusBadge status={order.production_status} />
        <PaymentStatusBadge status={order.payment_status} />
        {order.production_status !== "teslim_edildi" && (
          <DeliveryCountdownBadge deliveryDate={order.delivery_date} />
        )}
        <span className="text-sm font-semibold text-ink">{formatTL(order.total_price)}</span>
      </div>
    </Link>
  );
}
