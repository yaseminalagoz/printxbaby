import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Phone, Instagram, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { addPayment, deleteOrder } from "@/lib/actions/orders";
import { formatDate } from "@/lib/dates";
import { formatTL } from "@/lib/pricing";
import {
  LED_LABELS,
  ORDER_SIZE_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderWithCustomer,
} from "@/lib/types";
import { OrderStatusSelect } from "@/components/order-status-select";
import { DeliveryCountdownBadge } from "@/components/delivery-badge";
import { DeliveryTypeBadge, PaymentStatusBadge } from "@/components/status-badge";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";

export const dynamic = "force-dynamic";

const PAYMENT_METHODS: ("iban" | "shopier" | "nakit")[] = ["iban", "shopier", "nakit"];

const DETAIL_FIELDS: { key: keyof OrderWithCustomer; label: string }[] = [
  { key: "model", label: "Model" },
  { key: "main_letter", label: "Ana Harf" },
  { key: "letter_color", label: "Harf Rengi" },
  { key: "name_color", label: "İsim Rengi" },
  { key: "decoration_color", label: "Süsleme Rengi" },
  { key: "extra_figures", label: "Ek Figürler" },
];

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, customer:customers(*)")
    .eq("id", params.id)
    .single();

  if (error || !order) notFound();

  const o = order as OrderWithCustomer;
  const isDelivered = o.production_status === "teslim_edildi";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft size={16} /> Siparişlere dön
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-ink">
              #{o.order_no} — {o.name}
              {o.second_name ? ` & ${o.second_name}` : ""}
            </h1>
            <DeliveryTypeBadge type={o.delivery_type} />
            <PaymentStatusBadge status={o.payment_status} />
            {!isDelivered && <DeliveryCountdownBadge deliveryDate={o.delivery_date} />}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/orders/${o.id}/edit`} className="btn-secondary">
            <Pencil size={15} /> Düzenle
          </Link>
          <form action={deleteOrder.bind(null, o.id)}>
            <ConfirmDeleteButton confirmText="Bu siparişi silmek istediğinize emin misiniz?" />
          </form>
        </div>
      </div>

      {searchParams.error && (
        <div className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger-600">{searchParams.error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Ürün Bilgileri</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Ölçü" value={ORDER_SIZE_LABELS[o.size]} />
              <Field label="Led" value={LED_LABELS[o.led]} />
              {DETAIL_FIELDS.map((f) => (
                <Field key={f.key} label={f.label} value={(o[f.key] as string) || "—"} />
              ))}
            </div>

            {o.design_images?.length > 0 && (
              <div className="mt-5">
                <p className="label">Tasarım Görselleri</p>
                <div className="flex flex-wrap gap-3">
                  {o.design_images.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative h-28 w-28 overflow-hidden rounded-xl border border-border"
                    >
                      <Image src={url} alt="Tasarım görseli" fill className="object-cover" unoptimized />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {o.notes && (
              <div className="mt-5">
                <p className="label">Notlar</p>
                <p className="text-sm text-ink">{o.notes}</p>
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Teslimat ve Üretim</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Sipariş Tarihi" value={formatDate(o.order_date)} />
              <Field label="Teslim Tarihi" value={formatDate(o.delivery_date)} />
              <Field label="Teslimat Tipi" value={<DeliveryTypeBadge type={o.delivery_type} />} />
              {o.shipped_at && <Field label="Kargoya Verildi" value={formatDate(o.shipped_at)} />}
              {o.delivered_at && <Field label="Teslim Edildi" value={formatDate(o.delivered_at)} />}
            </div>
            <div className="mt-4">
              <p className="label">Üretim Durumu</p>
              <div className="max-w-xs">
                <OrderStatusSelect orderId={o.id} current={o.production_status} />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Müşteri</h2>
            <Link href={`/customers/${o.customer.id}`} className="block hover:text-brand-600">
              <p className="font-medium text-ink">{o.customer.full_name}</p>
            </Link>
            <div className="mt-2 space-y-1.5 text-sm text-muted">
              {o.customer.phone && (
                <p className="flex items-center gap-1.5">
                  <Phone size={14} /> {o.customer.phone}
                </p>
              )}
              {o.customer.instagram_username && (
                <p className="flex items-center gap-1.5">
                  <Instagram size={14} /> @{o.customer.instagram_username}
                </p>
              )}
              {o.customer.address && (
                <p className="flex items-center gap-1.5">
                  <MapPin size={14} /> {o.customer.address}
                </p>
              )}
            </div>
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Ödeme</h2>

            <div className="space-y-1.5 text-sm">
              <Row label="Sipariş Toplamı" value={formatTL(o.total_price)} strong />
              <Row label="Kapora" value={formatTL(o.deposit_amount)} />
              <Row label="Kalan Ödenen" value={formatTL(o.remaining_paid_amount)} />
              <Row label="Kalan Ödeme" value={formatTL(o.remaining_payment)} strong />
              <div className="pt-1">
                <PaymentStatusBadge status={o.payment_status} />
              </div>
            </div>

            {o.remaining_payment > 0 && (
              <div className="space-y-3 border-t border-border pt-4">
                {o.deposit_amount === 0 && (
                  <PaymentMiniForm orderId={o.id} type="kapora" label="Kapora Ekle" />
                )}
                <PaymentMiniForm orderId={o.id} type="kalan" label="Ödeme Ekle (Kalan)" />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-semibold text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}

function PaymentMiniForm({
  orderId,
  type,
  label,
}: {
  orderId: string;
  type: "kapora" | "kalan";
  label: string;
}) {
  return (
    <form action={addPayment} className="space-y-2">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="type" value={type} />
      <p className="text-xs font-semibold text-ink">{label}</p>
      <div className="flex gap-2">
        <input className="input" type="number" min="1" step="1" name="amount" placeholder="Tutar" required />
        <select className="input" name="method" required defaultValue="">
          <option value="" disabled>
            Yöntem
          </option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABELS[m]}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-secondary w-full">
        Kaydet
      </button>
    </form>
  );
}
