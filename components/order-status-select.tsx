"use client";

import { useRef } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import {
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_STATUS_ORDER,
  type ProductionStatus,
} from "@/lib/types";

export function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: ProductionStatus;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateOrderStatus} onClick={(e) => e.stopPropagation()}>
      <input type="hidden" name="order_id" value={orderId} />
      <select
        name="production_status"
        defaultValue={current}
        onChange={() => formRef.current?.requestSubmit()}
        className="input cursor-pointer text-sm"
      >
        {PRODUCTION_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {PRODUCTION_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </form>
  );
}
