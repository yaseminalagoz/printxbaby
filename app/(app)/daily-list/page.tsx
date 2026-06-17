import { createClient } from "@/lib/supabase/server";
import type { OrderWithCustomer } from "@/lib/types";
import { buildDailyProductionList } from "@/lib/dashboard";
import { remainingDays } from "@/lib/dates";
import { OrderRow } from "@/components/order-row";

export const dynamic = "force-dynamic";

export default async function DailyListPage() {
  const supabase = createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, customer:customers(*)")
    .order("delivery_date", { ascending: true });

  if (error) {
    return <div className="card p-6 text-danger-600">Liste yüklenemedi: {error.message}</div>;
  }

  const sorted = buildDailyProductionList((orders ?? []) as OrderWithCustomer[]);

  const grupHizliKargo = sorted.filter((o) => o.delivery_type === "hizli_kargo");
  const grupAcil = sorted.filter((o) => o.delivery_type !== "hizli_kargo" && o.delivery_type === "acil");
  const grupYaklasan = sorted.filter(
    (o) => o.delivery_type === "normal" && remainingDays(o.delivery_date) <= 7
  );
  const grupNormal = sorted.filter(
    (o) => o.delivery_type === "normal" && remainingDays(o.delivery_date) > 7
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Günlük Üretim Listesi</h1>
        <p className="mt-1 text-sm text-muted">
          Öncelik sırası: Hızlı Kargo → Acil → Teslim Tarihi Yaklaşanlar → Normal Siparişler
        </p>
      </div>

      <ListSection
        title="1. Hızlı Kargo"
        orders={grupHizliKargo}
        emptyText="Hızlı kargo siparişi yok."
      />
      <ListSection title="2. Acil" orders={grupAcil} emptyText="Acil sipariş yok." />
      <ListSection
        title="3. Teslim Tarihi Yaklaşanlar (≤ 7 gün)"
        orders={grupYaklasan}
        emptyText="Yaklaşan teslimat yok."
      />
      <ListSection title="4. Normal Siparişler" orders={grupNormal} emptyText="Normal sipariş yok." />
    </div>
  );
}

function ListSection({
  title,
  orders,
  emptyText,
}: {
  title: string;
  orders: OrderWithCustomer[];
  emptyText: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium text-ink/70">
          {orders.length} sipariş
        </span>
      </div>
      {orders.length === 0 ? (
        <div className="card p-5 text-sm text-muted">{emptyText}</div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}
