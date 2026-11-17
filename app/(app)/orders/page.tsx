import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  DELIVERY_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_STATUS_ORDER,
  type DeliveryType,
  type OrderWithCustomer,
  type PaymentStatus,
} from "@/lib/types";
import { BulkActions } from "@/components/bulk-actions";

export const dynamic = "force-dynamic";

const DELIVERY_TYPES: DeliveryType[] = ["normal", "acil", "hizli_kargo"];
const PAYMENT_STATUSES: PaymentStatus[] = ["odenmedi", "kapora_alindi", "tamamlandi"];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: {
    production_status?: string;
    delivery_type?: string;
    payment_status?: string;
    customer_id?: string;
    q?: string;
  };
}) {
  const supabase = createClient();
  let query = supabase
    .from("orders")
    .select("*, customer:customers(*)")
    .order("delivery_date", { ascending: true });

  if (searchParams.production_status) {
    query = query.eq("production_status", searchParams.production_status);
  }
  if (searchParams.delivery_type) {
    query = query.eq("delivery_type", searchParams.delivery_type);
  }
  if (searchParams.payment_status) {
    query = query.eq("payment_status", searchParams.payment_status);
  }
  if (searchParams.customer_id) {
    query = query.eq("customer_id", searchParams.customer_id);
  }

  const { data: orders, error } = await query;

  let filtered = (orders ?? []) as OrderWithCustomer[];
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.second_name ?? "").toLowerCase().includes(q) ||
        o.customer?.full_name?.toLowerCase().includes(q) ||
        String(o.order_no).includes(q)
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Siparişler</h1>
          <p className="mt-1 text-sm text-muted">{filtered.length} sipariş</p>
        </div>
        <Link href="/orders/new" className="btn-primary">
          <Plus size={16} /> Yeni Sipariş
        </Link>
      </div>

      <form className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:flex-wrap">
        <div className="flex-1 sm:min-w-[180px]">
          <label className="label">Ara</label>
          <input className="input" type="text" name="q" defaultValue={searchParams.q} placeholder="İsim, müşteri veya sipariş no" />
        </div>
        <div className="sm:min-w-[160px]">
          <label className="label">Üretim Durumu</label>
          <select className="input" name="production_status" defaultValue={searchParams.production_status ?? ""}>
            <option value="">Tümü</option>
            {PRODUCTION_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {PRODUCTION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:min-w-[150px]">
          <label className="label">Teslimat Tipi</label>
          <select className="input" name="delivery_type" defaultValue={searchParams.delivery_type ?? ""}>
            <option value="">Tümü</option>
            {DELIVERY_TYPES.map((t) => (
              <option key={t} value={t}>
                {DELIVERY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:min-w-[150px]">
          <label className="label">Ödeme Durumu</label>
          <select className="input" name="payment_status" defaultValue={searchParams.payment_status ?? ""}>
            <option value="">Tümü</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {PAYMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            Filtrele
          </button>
          <Link href="/orders" className="btn-ghost">
            Temizle
          </Link>
        </div>
      </form>

      {error ? (
        <div className="card p-6 text-danger-600">Sipariş verileri yüklenemedi: {error.message}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted">
          Bu filtrelere uyan sipariş bulunamadı.
        </div>
      ) : (
        <BulkActions orders={filtered} />
      )}
    </div>
  );
}
