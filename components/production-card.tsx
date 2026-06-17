import Link from "next/link";
import { formatDateShort } from "@/lib/dates";
import { LED_LABELS, ORDER_SIZE_LABELS, type OrderWithCustomer } from "@/lib/types";
import { DeliveryCountdownBadge } from "./delivery-badge";
import { DeliveryTypeBadge } from "./status-badge";
import { OrderStatusSelect } from "./order-status-select";

export function ProductionCard({ order }: { order: OrderWithCustomer }) {
  return (
    <div className="card space-y-2.5 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/orders/${order.id}`} className="min-w-0">
          <p className="text-xs font-medium text-muted">#{order.order_no}</p>
          <p className="truncate font-medium text-ink hover:underline">
            {order.name}
            {order.second_name ? ` & ${order.second_name}` : ""}
          </p>
          <p className="truncate text-xs text-muted">{order.customer?.full_name}</p>
        </Link>
        <DeliveryTypeBadge type={order.delivery_type} />
      </div>

      <p className="text-xs text-muted">
        {ORDER_SIZE_LABELS[order.size]} · {LED_LABELS[order.led]} · Teslim:{" "}
        {formatDateShort(order.delivery_date)}
      </p>

      <DeliveryCountdownBadge deliveryDate={order.delivery_date} />

      <OrderStatusSelect orderId={order.id} current={order.production_status} />
    </div>
  );
}
