import Link from "next/link";
import { Plus, Phone, Instagram } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  let query = supabase.from("customers").select("*").order("full_name", { ascending: true });

  if (searchParams.q) {
    const q = searchParams.q.trim();
    query = query.or(
      `full_name.ilike.%${q}%,phone.ilike.%${q}%,instagram_username.ilike.%${q}%`
    );
  }

  const { data: customers, error } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Müşteriler</h1>
          <p className="mt-1 text-sm text-muted">{(customers ?? []).length} müşteri</p>
        </div>
        <Link href="/customers/new" className="btn-primary">
          <Plus size={16} /> Yeni Müşteri
        </Link>
      </div>

      <form className="card flex items-end gap-3 p-4">
        <div className="flex-1">
          <label className="label">Ara</label>
          <input
            className="input"
            type="text"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Ad, telefon veya instagram kullanıcı adı"
          />
        </div>
        <button type="submit" className="btn-primary">
          Ara
        </button>
        {searchParams.q && (
          <Link href="/customers" className="btn-ghost">
            Temizle
          </Link>
        )}
      </form>

      {error ? (
        <div className="card p-6 text-danger-600">Müşteri verileri yüklenemedi: {error.message}</div>
      ) : (customers ?? []).length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted">Müşteri bulunamadı.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(customers as Customer[]).map((c) => (
            <Link key={c.id} href={`/customers/${c.id}`} className="card p-4 transition-shadow hover:shadow-card">
              <p className="font-medium text-ink">{c.full_name}</p>
              <div className="mt-1.5 space-y-1 text-sm text-muted">
                {c.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone size={13} /> {c.phone}
                  </p>
                )}
                {c.instagram_username && (
                  <p className="flex items-center gap-1.5">
                    <Instagram size={13} /> @{c.instagram_username}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
