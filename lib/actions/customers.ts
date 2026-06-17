"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function readCustomerFields(formData: FormData) {
  return {
    full_name: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    instagram_username:
      String(formData.get("instagram_username") ?? "").trim().replace(/^@/, "") || null,
    address: String(formData.get("address") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createCustomer(formData: FormData) {
  const supabase = createClient();
  const fields = readCustomerFields(formData);

  if (!fields.full_name) {
    redirect(`/customers/new?error=${encodeURIComponent("Ad Soyad alanı zorunludur.")}`);
  }

  const { data, error } = await supabase
    .from("customers")
    .insert(fields)
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/customers/new?error=${encodeURIComponent(error?.message ?? "Müşteri oluşturulamadı.")}`);
  }

  revalidatePath("/customers");

  const redirectTo = String(formData.get("redirect_to") ?? "");
  if (redirectTo === "new-order") {
    redirect(`/orders/new?customer_id=${data!.id}`);
  }
  redirect(`/customers/${data!.id}`);
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const supabase = createClient();
  const fields = readCustomerFields(formData);

  const { error } = await supabase.from("customers").update(fields).eq("id", customerId);

  if (error) {
    redirect(`/customers/${customerId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function deleteCustomer(customerId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("customers").delete().eq("id", customerId);

  if (error) {
    redirect(`/customers/${customerId}?error=${encodeURIComponent("Bu müşteriye ait siparişler olduğu için silinemedi.")}`);
  }

  revalidatePath("/customers");
  redirect("/customers");
}
