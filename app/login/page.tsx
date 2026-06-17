import { signIn } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-2xl font-display text-white shadow-card">
            P
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            PrintxBaby
          </h1>
          <p className="mt-1 text-sm text-muted">Sipariş & Üretim Takip Sistemi</p>
        </div>

        <form action={signIn} className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              placeholder="ornek@printxbaby.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
              placeholder="••••••••"
            />
          </div>

          {searchParams?.error && (
            <p className="rounded-xl bg-danger-100 px-3 py-2 text-sm text-danger-600">
              {searchParams.error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full">
            Giriş Yap
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Hesabınız Supabase Authentication üzerinden yönetilmektedir.
        </p>
      </div>
    </div>
  );
}
