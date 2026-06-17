import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateCustomer, deleteCustomer } from "@/lib/actions/customers";
import type { Customer, OrderWithCustomer } from "@/lib/types";
import { OrderRow } from "@/components/order-row";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const supabase = createClient();

  const [{ data: customer, error }, { data: orders }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", params.id).single(),
    supabase
      .from("orders")
      .select("*, customer:customers(*)")
      .eq("customer_id", params.id)
      .order("order_date", { ascending: false }),
  ]);

  if (error || !customer) notFound();
  const c = customer as Customer;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/customers" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft size={16} /> Müşterilere dön
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{c.full_name}</h1>
        </div>
        <Link href={`/orders/new?customer_id=${c.id}`} className="btn-primary">
          <Plus size={16} /> Yeni Sipariş
        </Link>
      </div>

      {searchParams.error && (
        <div className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger-600">{searchParams.error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card space-y-4 p-5 lg:col-span-1">
          <h2 className="font-display text-lg font-semibold text-ink">Müşteri Bilgileri</h2>
          <form action={updateCustomer.bind(null, c.id)} className="space-y-4">
            <div>
              <label className="label">Ad Soyad *</label>
              <input className="input" name="full_name" defaultValue={c.full_name} required />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input className="input" name="phone" type="tel" defaultValue={c.phone ?? ""} />
            </div>
            <div>
              <label className="label">Instagram Kullanıcı Adı</label>
              <input className="input" name="instagram_username" defaultValue={c.instagram_username ?? ""} />
            </div>
            <div>
              <label className="label">Adres</label>
              <textarea className="input min-h-20" name="address" defaultValue={c.address ?? ""} />
            </div>
            <div>
              <label className="label">Notlar</label>
              <textarea className="input min-h-20" name="notes" defaultValue={c.notes ?? ""} />
            </div>
            <div className="flex justify-between">
              <button type="submit" className="btn-primary">
                Kaydet
              </button>
            </div>
          </form>
          <form action={deleteCustomer.bind(null, c.id)} className="border-t border-border pt-4">
            <ConfirmDeleteButton
              confirmText="Bu müşteriyi silmek istediğinize emin misiniz? Siparişi olan müşteriler silinemez."
              className="btn-danger w-full"
              label="Müşteriyi Sil"
            />
          </form>
        </section>

        <section className="space-y-3 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-ink">
            Sipariş Geçmişi ({(orders ?? []).length})
          </h2>
          {(orders ?? []).length === 0 ? (
            <div className="card p-6 text-sm text-muted">Bu müşterinin henüz siparişi yok.</div>
          ) : (
            <div className="space-y-2">
              {(orders as OrderWithCustomer[]).map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
