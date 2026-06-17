"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PRICING } from "@/lib/pricing";

export async function updatePricing(formData: FormData) {
  const supabase = createClient();

  const updates = DEFAULT_PRICING.map(async (row) => {
    const key = `price_${row.size}_${row.led}`;
    const value = Number(formData.get(key) ?? row.price);
    return supabase
      .from("pricing")
      .update({ price: value })
      .eq("size", row.size)
      .eq("led", row.led);
  });

  await Promise.all(updates);

  revalidatePath("/settings/pricing");
  revalidatePath("/orders/new");
  redirect("/settings/pricing?success=1");
}
