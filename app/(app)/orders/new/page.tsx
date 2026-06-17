import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/actions/orders";
import { OrderForm } from "@/components/order-form";
import type { Customer, PricingRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: { customer_id?: string; error?: string };
}) {
  const supabase = createClient();

  const [{ data: customers }, { data: pricing }] = await Promise.all([
    supabase.from("customers").select("*").order("full_name", { ascending: true }),
    supabase.from("pricing").select("*"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft size={16} /> Siparişlere dön
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Yeni Sipariş</h1>
        <p className="mt-1 text-sm text-muted">Müşteri seçip ürün bilgilerini girerek sipariş oluşturun.</p>
      </div>

      <OrderForm
        mode="create"
        customers={(customers ?? []) as Customer[]}
        pricing={(pricing ?? []) as PricingRow[]}
        initialCustomerId={searchParams.customer_id}
        action={createOrder}
        submitLabel="Sipariş Oluştur"
        error={searchParams.error}
      />
    </div>
  );
}
