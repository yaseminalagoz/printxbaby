import Link from "next/link";
import {
  Clock,
  Factory,
  PackageCheck,
  CheckCircle2,
  Wallet,
  PiggyBank,
  HandCoins,
  CalendarClock,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { OrderWithCustomer } from "@/lib/types";
import { computeDashboardStats } from "@/lib/dashboard";
import { formatTL } from "@/lib/pricing";
import { StatCard } from "@/components/stat-card";
import { OrderRow } from "@/components/order-row";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, customer:customers(*)")
    .order("delivery_date", { ascending: true });

  if (error) {
    return (
      <div className="card p-6 text-danger-600">
        Sipariş verileri yüklenemedi: {error.message}
      </div>
    );
  }

  const stats = computeDashboardStats((orders ?? []) as OrderWithCustomer[]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">PrintxBaby sipariş ve üretim genel durumu</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Bekleyen Siparişler" value={stats.bekleyenSiparisler.length} icon={Clock} tone="amber" hint="Tasarım aşamasında" />
        <StatCard label="Üretimdekiler" value={stats.uretimdekiler.length} icon={Factory} tone="brand" hint="Baskı / montaj aşamasında" />
        <StatCard label="Kargoya Hazırlar" value={stats.kargoyaHazirlar.length} icon={PackageCheck} tone="mint" hint="Hazır, kargo bekliyor" />
        <StatCard label="Tamamlananlar (Bu Ay)" value={stats.tamamlananlarBuAy.length} icon={CheckCircle2} tone="mint" hint="Teslim edildi" />
        <StatCard label="Bu Ayki Ciro" value={formatTL(stats.buAykiCiro)} icon={Wallet} tone="brand" hint="Bu ay oluşturulan siparişler" />
        <StatCard label="Alınan Kaporalar" value={formatTL(stats.alinanKaporalar)} icon={PiggyBank} tone="mint" hint="Bu ayki siparişlerden" />
        <StatCard label="Bekleyen Tahsilatlar" value={formatTL(stats.bekleyenTahsilatlar)} icon={HandCoins} tone="amber" hint="Teslim edilmemiş siparişlerden" />
        <StatCard label="Yaklaşan Teslimatlar" value={stats.yaklasanTeslimatlar.length} icon={CalendarClock} tone="amber" hint="7 gün ve altı" />
        <StatCard label="Hızlı Kargo Siparişleri" value={stats.hizliKargoSiparisleri.length} icon={Zap} tone="danger" hint="Öncelikli teslimat" />
      </div>

      {/* Uyarılar */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <AlertTriangle size={18} className="text-danger-400" /> Uyarılar
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AlertColumn
            title="Geciken Siparişler"
            tone="danger"
            orders={stats.gecikenSiparisler}
            emptyText="Geciken sipariş yok 🎉"
          />
          <AlertColumn
            title="3 Gün ve Altı Kalan"
            tone="amber"
            orders={stats.kritikSiparisler}
            emptyText="Bu kategoride sipariş yok"
          />
          <AlertColumn
            title="7 Gün ve Altı Kalan"
            tone="brand"
            orders={stats.yedigunSiparisler}
            emptyText="Bu kategoride sipariş yok"
          />
        </div>
      </section>

      {/* Hızlı Kargo Paneli */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Zap size={18} className="text-danger-400" /> Hızlı Kargo Siparişleri
          </h2>
          <Link href="/orders?delivery_type=hizli_kargo" className="text-sm font-medium text-brand-600 hover:underline">
            Tümünü gör
          </Link>
        </div>
        {stats.hizliKargoSiparisleri.length === 0 ? (
          <div className="card p-5 text-sm text-muted">Şu anda hızlı kargo siparişi yok.</div>
        ) : (
          <div className="space-y-2">
            {stats.hizliKargoSiparisleri.slice(0, 5).map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AlertColumn({
  title,
  tone,
  orders,
  emptyText,
}: {
  title: string;
  tone: "danger" | "amber" | "brand";
  orders: OrderWithCustomer[];
  emptyText: string;
}) {
  const toneText: Record<string, string> = {
    danger: "text-danger-600",
    amber: "text-amber-600",
    brand: "text-brand-700",
  };
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${toneText[tone]}`}>{title}</h3>
        <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-ink/70">
          {orders.length}
        </span>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {orders.slice(0, 6).map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="block rounded-lg px-2 py-1.5 text-sm hover:bg-black/5"
              >
                <span className="font-medium text-ink">#{o.order_no} {o.name}</span>
                <span className="ml-1 text-muted">— {o.customer?.full_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
