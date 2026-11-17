"use client";

import { useMemo, useState } from "react";
import { calculateDeliveryDate, formatDate, formatDateInput } from "@/lib/dates";
import { getPrice, formatTL } from "@/lib/pricing";
import {
  DELIVERY_TYPE_LABELS,
  LED_LABELS,
  ORDER_SIZE_LABELS,
  PAYMENT_METHOD_LABELS,
  type Customer,
  type DeliveryType,
  type LedOption,
  type Order,
  type OrderSize,
  type PricingRow,
} from "@/lib/types";
import { CustomerPicker } from "@/components/customer-picker";
import { DesignImageUploader } from "@/components/design-image-uploader";

const SIZES: OrderSize[] = ["25", "30", "35", "40"];
const LEDS: LedOption[] = ["ledli", "ledsiz"];
const DELIVERY_TYPES: DeliveryType[] = ["normal", "acil", "hizli_kargo"];
const PAYMENT_METHODS: ("iban" | "shopier" | "nakit")[] = ["iban", "shopier", "nakit"];

export function OrderForm({
  mode,
  customers,
  pricing,
  order,
  initialCustomerId,
  action,
  submitLabel,
  error,
}: {
  mode: "create" | "edit";
  customers: Customer[];
  pricing: PricingRow[];
  order?: Order;
  initialCustomerId?: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  error?: string;
}) {
  const [size, setSize] = useState<OrderSize>(order?.size ?? "30");
  const [led, setLed] = useState<LedOption>(order?.led ?? "ledli");
  const [kapiTulu, setKapiTulu] = useState(order?.kapi_tulu ?? false);
  const [magnet, setMagnet] = useState(order?.magnet ?? false);
  const [orderDate, setOrderDate] = useState(
    order?.order_date ? order.order_date.slice(0, 10) : formatDateInput()
  );

  const basePrice = useMemo(() => getPrice(pricing, size, led), [pricing, size, led]);
  const price = useMemo(() => basePrice + (kapiTulu ? 500 : 0) + (magnet ? 80 : 0), [basePrice, kapiTulu, magnet]);
  const deliveryPreview = useMemo(
    () => calculateDeliveryDate(orderDate || formatDateInput()),
    [orderDate]
  );

  return (
    <form action={action} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger-600">{error}</div>
      )}

      <section className="card space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Müşteri</h2>
        {mode === "create" ? (
          <CustomerPicker customers={customers} initialCustomerId={initialCustomerId} />
        ) : (
          <div>
            <input type="hidden" name="customer_id" value={order?.customer_id ?? ""} />
            <p className="text-sm text-muted">
              Müşteri değiştirilemez. Bu siparişi farklı bir müşteriye taşımak isterseniz
              yeni bir sipariş oluşturun.
            </p>
          </div>
        )}
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Ürün Bilgileri</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">İsim *</label>
            <input className="input" name="name" defaultValue={order?.name} required />
          </div>
          <div>
            <label className="label">İkinci İsim</label>
            <input className="input" name="second_name" defaultValue={order?.second_name ?? ""} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Ölçü *</label>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <label
                  key={s}
                  className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-medium transition-colors ${
                    size === s
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-border text-ink hover:border-brand-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    checked={size === s}
                    onChange={() => setSize(s)}
                    className="hidden"
                  />
                  {ORDER_SIZE_LABELS[s]}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Led *</label>
            <div className="flex gap-2">
              {LEDS.map((l) => (
                <label
                  key={l}
                  className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-medium transition-colors ${
                    led === l
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-border text-ink hover:border-brand-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="led"
                    value={l}
                    checked={led === l}
                    onChange={() => setLed(l)}
                    className="hidden"
                  />
                  {LED_LABELS[l]}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="label">Ek Opsiyonlar</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${kapiTulu ? "border-brand-500 bg-brand-50" : "border-border hover:border-brand-300"}`}>
              <input type="checkbox" name="kapi_tulu" checked={kapiTulu} onChange={(e) => setKapiTulu(e.target.checked)} className="h-4 w-4 accent-brand-500" />
              <span className="text-sm font-medium text-ink">Kapı Tülü <span className="text-muted">+500₺</span></span>
            </label>
            <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${magnet ? "border-brand-500 bg-brand-50" : "border-border hover:border-brand-300"}`}>
              <input type="checkbox" name="magnet" checked={magnet} onChange={(e) => setMagnet(e.target.checked)} className="h-4 w-4 accent-brand-500" />
              <span className="text-sm font-medium text-ink">Magnet <span className="text-muted">+80₺</span></span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
          <span className="text-sm font-medium text-brand-700">Hesaplanan Fiyat</span>
          <span className="font-display text-xl font-semibold text-brand-700">{formatTL(price)}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Model</label>
            <input className="input" name="model" defaultValue={order?.model ?? ""} />
          </div>
          <div>
            <label className="label">Ana Harf</label>
            <input className="input" name="main_letter" defaultValue={order?.main_letter ?? ""} />
          </div>
          <div>
            <label className="label">Harf Rengi</label>
            <input className="input" name="letter_color" defaultValue={order?.letter_color ?? ""} />
          </div>
          <div>
            <label className="label">İsim Rengi</label>
            <input className="input" name="name_color" defaultValue={order?.name_color ?? ""} />
          </div>
          <div>
            <label className="label">Süsleme Rengi</label>
            <input className="input" name="decoration_color" defaultValue={order?.decoration_color ?? ""} />
          </div>
          <div>
            <label className="label">Ek Figürler</label>
            <input className="input" name="extra_figures" defaultValue={order?.extra_figures ?? ""} />
          </div>
        </div>

        <div>
          <label className="label">Tasarım Görselleri</label>
          <DesignImageUploader initialImages={order?.design_images ?? []} />
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Teslimat</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mode === "create" && (
            <div>
              <label className="label">Sipariş Tarihi</label>
              <input
                className="input"
                type="date"
                name="order_date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="label">Teslimat Tipi *</label>
            <select className="input" name="delivery_type" defaultValue={order?.delivery_type ?? "normal"}>
              {DELIVERY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {DELIVERY_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {mode === "create" && (
          <p className="text-sm text-muted">
            Tahmini teslim tarihi: <strong className="text-ink">{formatDate(deliveryPreview)}</strong>{" "}
            (sipariş tarihi + 20 gün)
          </p>
        )}
      </section>

      {mode === "create" && (
        <section className="card space-y-4 p-5">
          <h2 className="font-display text-lg font-semibold text-ink">Kapora (opsiyonel)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Kapora Tutarı</label>
              <input className="input" type="number" min="0" step="1" name="deposit_amount" defaultValue={0} />
            </div>
            <div>
              <label className="label">Ödeme Yöntemi</label>
              <select className="input" name="deposit_method" defaultValue="">
                <option value="">Seçiniz</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      <section className="card space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Notlar</h2>
        <textarea className="input min-h-24" name="notes" defaultValue={order?.notes ?? ""} />
      </section>

      <div className="flex justify-end gap-3">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
