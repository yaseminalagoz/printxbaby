"use client";

import { useState, useTransition } from "react";
import { CheckSquare, Square, PackageCheck } from "lucide-react";
import { bulkMarkDelivered } from "@/lib/actions/orders";
import { PRODUCTION_STATUS_LABELS, PRODUCTION_STATUS_ORDER, type OrderWithCustomer } from "@/lib/types";
import { ProductionCard } from "@/components/production-card";

export function ProductionBoard({ orders }: { orders: OrderWithCustomer[] }) {
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

  const handleBulkDeliver = () => {
    if (selected.size === 0) return;
    startTransition(async () => {
      try {
        await bulkMarkDelivered(Array.from(selected));
        setMessage(`${selected.size} sipariş teslim edildi ✅`);
        setSelected(new Set());
        setTimeout(() => setMessage(null), 3000);
      } catch {
        setMessage("Hata oluştu, tekrar dene.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Toplu işlem toolbar */}
      {selected.size > 0 && (
        <div className="card flex items-center gap-3 px-4 py-3 border-brand-300 bg-brand-50">
          <span className="text-sm font-medium text-brand-700">{selected.size} sipariş seçili</span>
          <button
            type="button"
            onClick={handleBulkDeliver}
            disabled={isPending}
            className="btn-primary flex items-center gap-2 py-1.5 text-sm"
          >
            <PackageCheck size={15} />
            {isPending ? "İşleniyor..." : "Teslim Edildi Olarak İşaretle"}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-sm text-muted hover:text-ink"
          >
            İptal
          </button>
        </div>
      )}

      {message && (
        <div className="card px-4 py-3 text-sm text-green-700 bg-green-50 border-green-200">
          {message}
        </div>
      )}

      {/* Kanban kolonları */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {PRODUCTION_STATUS_ORDER.map((status) => {
          const columnOrders = orders.filter((o) => o.production_status === status);
          return (
            <div key={status} className="w-72 shrink-0">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-ink">{PRODUCTION_STATUS_LABELS[status]}</h2>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-ink/70">
                  {columnOrders.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {columnOrders.length === 0 ? (
                  <p className="px-1 text-xs text-muted">Sipariş yok</p>
                ) : (
                  columnOrders.map((order) => (
                    <div key={order.id} className="relative">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggle(order.id)}
                        className="absolute left-2 top-2 z-10 text-muted hover:text-brand-500 transition-colors"
                      >
                        {selected.has(order.id) ? (
                          <CheckSquare size={16} className="text-brand-500" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                      <div className={`transition-all ${selected.has(order.id) ? "ring-2 ring-brand-400 rounded-xl" : ""}`}>
                        <ProductionCard order={order} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
