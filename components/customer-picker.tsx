"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import type { Customer } from "@/lib/types";

export function CustomerPicker({
  customers,
  initialCustomerId,
}: {
  customers: Customer[];
  initialCustomerId?: string;
}) {
  const initial = customers.find((c) => c.id === initialCustomerId) ?? null;
  const [selected, setSelected] = useState<Customer | null>(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q) ||
          (c.instagram_username ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [customers, query]);

  return (
    <div className="relative">
      <input type="hidden" name="customer_id" value={selected?.id ?? ""} required />

      {selected ? (
        <div className="flex items-center justify-between rounded-xl border border-border bg-black/[0.02] px-3 py-2">
          <div>
            <p className="text-sm font-medium text-ink">{selected.full_name}</p>
            <p className="text-xs text-muted">
              {selected.phone ?? "—"}
              {selected.instagram_username ? ` · @${selected.instagram_username}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setQuery("");
            }}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Değiştir
          </button>
        </div>
      ) : (
        <div>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9"
              placeholder="Müşteri adı, telefon veya instagram ile ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
            />
          </div>

          {open && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-card">
              {filtered.length === 0 ? (
                <div className="px-3 py-3 text-sm text-muted">Müşteri bulunamadı.</div>
              ) : (
                <ul className="max-h-56 overflow-y-auto">
                  {filtered.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(c);
                          setOpen(false);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5"
                      >
                        <span className="font-medium text-ink">{c.full_name}</span>
                        <span className="ml-1 text-muted">
                          {c.phone ? `· ${c.phone}` : ""}
                          {c.instagram_username ? ` · @${c.instagram_username}` : ""}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/customers/new?redirect_to=new-order"
                className="flex items-center gap-1.5 border-t border-border px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                <UserPlus size={14} /> Yeni Müşteri Ekle
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
