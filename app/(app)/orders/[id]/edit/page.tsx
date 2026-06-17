import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateOrder } from "@/lib/actions/orders";
import { OrderForm } from "@/components/order-form";
import type { Customer, Order, PricingRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditOrderPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const supabase = createClient();

  const [{ data: order, error }, { data: customers }, { data: pricing }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", params.id).single(),
    supabase.from("customers").select("*").order("full_name", { ascending: true }),
    supabase.from("pricing").select("*"),
  ]);

  if (error || !order) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/orders/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft size={16} /> Sipariş detayına dön
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          Sipariş #{(order as Order).order_no} Düzenle
        </h1>
      </div>

      <OrderForm
        mode="edit"
        customers={(customers ?? []) as Customer[]}
        pricing={(pricing ?? []) as PricingRow[]}
        order={order as Order}
        action={updateOrder.bind(null, params.id)}
        submitLabel="Değişiklikleri Kaydet"
        error={searchParams.error}
      />
    </div>
  );
}
