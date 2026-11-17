"use client";

import { useState, useTransition } from "react";
import { CheckSquare, Square, PackageCheck } from "lucide-react";
import { bulkMarkDelivered } from "@/lib/actions/orders";
import type { OrderWithCustomer } from "@/lib/types";

export function BulkActions({ orders }: { orders: OrderWithCustomer[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === orders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o.id)));
    }
  };

  const handleBulkDeliver = () => {
    if (selected.size === 0) return;
    startTransition(async () => {
      try {
        await bulkMarkDelivered(Array.from(selected));
        setMessage(`${selected.size} sipariş teslim edildi olarak işaretlendi ✅`);
        setSelected(new Set());
      } catch (e) {
        setMessage("Hata oluştu, tekrar dene.");
      }
    });
  };

  const allSelected = orders.length > 0 && selected.size === orders.length;

  return (
    <div className="space-y-2">
      {/* Toplu işlem toolbar */}
      <div className="card flex flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={toggleAll}
          className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
        >
          {allSelected ? <CheckSquare size={16} className="text-brand-500" /> : <Square size={16} />}
          {allSelected ? "Tümünü kaldır" : "Tümünü seç"}
        </button>

        {selected.size > 0 && (
          <>
            <span className="text-sm text-muted">{selected.size} seçili</span>
            <button
              type="button"
              onClick={handleBulkDeliver}
              disabled={isPending}
              className="btn-primary flex items-center gap-2 py-1.5 text-sm"
            >
              <PackageCheck size={15} />
              {isPending ? "İşleniyor..." : "Teslim Edildi"}
            </button>
          </>
        )}

        {message && (
          <span className="text-sm text-green-600">{message}</span>
        )}
      </div>

      {/* Sipariş listesi */}
      {orders.map((order) => (
        <div key={order.id} className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => toggle(order.id)}
            className="mt-4 flex-shrink-0 text-muted hover:text-brand-500 transition-colors"
          >
            {selected.has(order.id) ? (
              <CheckSquare size={18} className="text-brand-500" />
            ) : (
              <Square size={18} />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <OrderRowWrapper order={order} />
          </div>
        </div>
      ))}
    </div>
  );
}

// OrderRow'u import edip sarmak için
import { OrderRow } from "@/components/order-row";

function OrderRowWrapper({ order }: { order: OrderWithCustomer }) {
  return <OrderRow order={order} />;
}
