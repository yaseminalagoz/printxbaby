import { createClient } from "@/lib/supabase/server";
import {
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_STATUS_ORDER,
  type OrderWithCustomer,
} from "@/lib/types";
import { ProductionCard } from "@/components/production-card";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
  const supabase = createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, customer:customers(*)")
    .order("delivery_date", { ascending: true });

  if (error) {
    return <div className="card p-6 text-danger-600">Pano yüklenemedi: {error.message}</div>;
  }

  const all = (orders ?? []) as OrderWithCustomer[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Üretim Takip</h1>
        <p className="mt-1 text-sm text-muted">
          Sipariş durumunu kartın altındaki menüden değiştirebilirsiniz.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {PRODUCTION_STATUS_ORDER.map((status) => {
          const columnOrders = all.filter((o) => o.production_status === status);
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
                  columnOrders.map((order) => <ProductionCard key={order.id} order={order} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
