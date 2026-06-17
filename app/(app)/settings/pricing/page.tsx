import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updatePricing } from "@/lib/actions/pricing";
import { DEFAULT_PRICING } from "@/lib/pricing";
import { LED_LABELS, ORDER_SIZE_LABELS, type PricingRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PricingSettingsPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  const supabase = createClient();
  const { data: pricing } = await supabase.from("pricing").select("*");
  const rows: PricingRow[] = (pricing?.length ? pricing : DEFAULT_PRICING) as PricingRow[];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Fiyat Ayarları</h1>
        <p className="mt-1 text-sm text-muted">
          Ölçü ve led seçeneğine göre sipariş fiyatlarını buradan güncelleyebilirsiniz.
        </p>
      </div>

      {searchParams.success && (
        <div className="flex items-center gap-2 rounded-xl bg-mint-100 px-4 py-3 text-sm text-mint-600">
          <CheckCircle2 size={16} /> Fiyatlar güncellendi.
        </div>
      )}

      <form action={updatePricing} className="card space-y-4 p-5">
        {DEFAULT_PRICING.map((defaultRow) => {
          const row = rows.find((r) => r.size === defaultRow.size && r.led === defaultRow.led) ?? defaultRow;
          const key = `price_${row.size}_${row.led}`;
          return (
            <div key={key} className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
              <span className="text-sm font-medium text-ink">
                {ORDER_SIZE_LABELS[row.size]} · {LED_LABELS[row.led]}
              </span>
              <div className="flex items-center gap-2">
                <input
                  className="input w-32 text-right"
                  type="number"
                  min="0"
                  step="1"
                  name={key}
                  defaultValue={row.price}
                />
                <span className="text-sm text-muted">TL</span>
              </div>
            </div>
          );
        })}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Fiyatları Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
