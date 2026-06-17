import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCustomer } from "@/lib/actions/customers";

export default function NewCustomerPage({
  searchParams,
}: {
  searchParams: { error?: string; redirect_to?: string };
}) {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/customers" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft size={16} /> Müşterilere dön
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Yeni Müşteri</h1>
      </div>

      {searchParams.error && (
        <div className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger-600">{searchParams.error}</div>
      )}

      <form action={createCustomer} className="card space-y-4 p-5">
        {searchParams.redirect_to && (
          <input type="hidden" name="redirect_to" value={searchParams.redirect_to} />
        )}
        <div>
          <label className="label">Ad Soyad *</label>
          <input className="input" name="full_name" required autoFocus />
        </div>
        <div>
          <label className="label">Telefon</label>
          <input className="input" name="phone" type="tel" placeholder="05XX XXX XX XX" />
        </div>
        <div>
          <label className="label">Instagram Kullanıcı Adı</label>
          <input className="input" name="instagram_username" placeholder="kullaniciadi" />
        </div>
        <div>
          <label className="label">Adres</label>
          <textarea className="input min-h-20" name="address" />
        </div>
        <div>
          <label className="label">Notlar</label>
          <textarea className="input min-h-20" name="notes" />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            {searchParams.redirect_to === "new-order" ? "Kaydet ve Siparişe Geç" : "Müşteriyi Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
