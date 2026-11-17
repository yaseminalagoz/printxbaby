"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  DeliveryType,
  LedOption,
  OrderSize,
  PaymentMethod,
  ProductionStatus,
} from "@/lib/types";

function parseImages(formData: FormData): string[] {
  const raw = String(formData.get("design_images") ?? "[]");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function readOrderFields(formData: FormData) {
  return {
    customer_id: String(formData.get("customer_id") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    second_name: String(formData.get("second_name") ?? "").trim() || null,
    size: String(formData.get("size") ?? "30") as OrderSize,
    led: String(formData.get("led") ?? "ledsiz") as LedOption,
    model: String(formData.get("model") ?? "").trim() || null,
    main_letter: String(formData.get("main_letter") ?? "").trim() || null,
    letter_color: String(formData.get("letter_color") ?? "").trim() || null,
    name_color: String(formData.get("name_color") ?? "").trim() || null,
    decoration_color: String(formData.get("decoration_color") ?? "").trim() || null,
    extra_figures: String(formData.get("extra_figures") ?? "").trim() || null,
    kapi_tulu: formData.get("kapi_tulu") === "on",
    magnet_adet: Number(formData.get("magnet_adet") ?? 0) || 0,
    delivery_type: String(formData.get("delivery_type") ?? "normal") as DeliveryType,
    notes: String(formData.get("notes") ?? "").trim() || null,
    design_images: parseImages(formData),
  };
}

export async function createOrder(formData: FormData) {
  const supabase = createClient();
  const fields = readOrderFields(formData);
  const order_date = String(formData.get("order_date") ?? "") || undefined;
  const deposit_amount = Number(formData.get("deposit_amount") ?? 0) || 0;
  const deposit_methodRaw = String(formData.get("deposit_method") ?? "");
  const deposit_method = (deposit_methodRaw || null) as PaymentMethod | null;

  if (!fields.customer_id || !fields.name) {
    redirect(
      `/orders/new?customer_id=${fields.customer_id}&error=${encodeURIComponent(
        "Müşteri ve İsim alanları zorunludur."
      )}`
    );
  }

  const { data: priceRow } = await supabase
    .from("pricing")
    .select("price")
    .eq("size", fields.size)
    .eq("led", fields.led)
    .single();

  const base_price = priceRow?.price ?? 0;
  const total_price = base_price + (fields.kapi_tulu ? 500 : 0) + (fields.magnet_adet * 80);

  const insertPayload: Record<string, unknown> = {
    ...fields,
    total_price,
    deposit_amount,
    deposit_method,
  };
  if (order_date) insertPayload.order_date = order_date;

  const { data, error } = await supabase
    .from("orders")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      `/orders/new?error=${encodeURIComponent(error?.message ?? "Sipariş oluşturulamadı.")}`
    );
  }

  revalidatePath("/orders");
  revalidatePath("/");
  revalidatePath("/production");
  revalidatePath("/daily-list");
  redirect(`/orders/${data!.id}`);
}

export async function updateOrder(orderId: string, formData: FormData) {
  const supabase = createClient();
  const fields = readOrderFields(formData);

  const { data: priceRow } = await supabase
    .from("pricing")
    .select("price")
    .eq("size", fields.size)
    .eq("led", fields.led)
    .single();

  const base_price = priceRow?.price ?? 0;
  const total_price = base_price + (fields.kapi_tulu ? 500 : 0) + (fields.magnet_adet * 80);

  const { error } = await supabase
    .from("orders")
    .update({ ...fields, total_price })
    .eq("id", orderId);

  if (error) {
    redirect(`/orders/${orderId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");
  redirect(`/orders/${orderId}`);
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = createClient();
  const orderId = String(formData.get("order_id") ?? "");
  const status = String(formData.get("production_status") ?? "") as ProductionStatus;

  const patch: Record<string, unknown> = { production_status: status };
  const today = new Date().toISOString().slice(0, 10);
  if (status === "kargoya_verildi") patch.shipped_at = today;
  if (status === "teslim_edildi") patch.delivered_at = today;

  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);

  if (error) {
    redirect(`/orders/${orderId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/production");
  revalidatePath("/daily-list");
  revalidatePath("/");
  redirect(`/orders/${orderId}`);
}

export async function bulkMarkDelivered(orderIds: string[]) {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("orders")
    .update({ production_status: "teslim_edildi", delivered_at: today })
    .in("id", orderIds);

  if (error) throw new Error(error.message);

  revalidatePath("/orders");
  revalidatePath("/production");
  revalidatePath("/daily-list");
  revalidatePath("/");
}

export async function addPayment(formData: FormData) {
  const supabase = createClient();
  const orderId = String(formData.get("order_id") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const method = String(formData.get("method") ?? "") as PaymentMethod;
  const type = String(formData.get("type") ?? "kapora");

  if (!orderId || !amount || amount <= 0) {
    redirect(`/orders/${orderId}?error=${encodeURIComponent("Geçerli bir tutar giriniz.")}`);
  }

  const today = new Date().toISOString().slice(0, 10);

  if (type === "kapora") {
    const { data: order } = await supabase
      .from("orders")
      .select("deposit_amount")
      .eq("id", orderId)
      .single();
    const newDeposit = (order?.deposit_amount ?? 0) + amount;
    await supabase
      .from("orders")
      .update({ deposit_amount: newDeposit, deposit_method: method })
      .eq("id", orderId);
  } else {
    const { data: order } = await supabase
      .from("orders")
      .select("remaining_paid_amount")
      .eq("id", orderId)
      .single();
    const newRemaining = (order?.remaining_paid_amount ?? 0) + amount;
    await supabase
      .from("orders")
      .update({
        remaining_paid_amount: newRemaining,
        remaining_paid_method: method,
        remaining_paid_at: today,
      })
      .eq("id", orderId);
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/");
  redirect(`/orders/${orderId}`);
}

export async function deleteOrder(orderId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("orders").delete().eq("id", orderId);

  if (error) {
    redirect(`/orders/${orderId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/orders");
  revalidatePath("/");
  redirect("/orders");
}
