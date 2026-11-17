import { createClient } from "@/lib/supabase/server";
import { type OrderWithCustomer } from "@/lib/types";
import { ProductionBoard } from "@/components/production-board";

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

      <ProductionBoard orders={all} />
    </div>
  );
}
