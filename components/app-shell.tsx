"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Factory,
  ListChecks,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/daily-list", label: "Günlük Üretim Listesi", icon: ListChecks },
  { href: "/production", label: "Üretim Takip", icon: Factory },
  { href: "/orders", label: "Siparişler", icon: Package },
  { href: "/customers", label: "Müşteriler", icon: Users },
  { href: "/settings/pricing", label: "Fiyat Ayarları", icon: Settings },
];

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const NavLinks = () => (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-500 text-white shadow-soft"
                : "text-ink/70 hover:bg-brand-50 hover:text-brand-700"
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Masaüstü sol menü */}
      <aside className="hidden w-64 flex-col border-r border-border bg-surface py-6 lg:flex">
        <div className="mb-6 flex items-center gap-2 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 font-display text-white">
            P
          </div>
          <span className="font-display text-lg font-semibold">PrintxBaby</span>
        </div>
        <NavLinks />
        <div className="mt-auto border-t border-border px-4 pt-4">
          <p className="mb-2 truncate text-xs text-muted">{userEmail}</p>
          <form action={signOut}>
            <button type="submit" className="btn-ghost w-full justify-start gap-2 text-sm">
              <LogOut size={16} /> Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      {/* Mobil üst bar */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-display text-sm text-white">
            P
          </div>
          <span className="font-display text-base font-semibold">PrintxBaby</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 hover:bg-black/5"
          aria-label="Menüyü aç"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobil açılır panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface py-6 shadow-card">
            <div className="mb-6 flex items-center justify-between px-4">
              <span className="font-display text-lg font-semibold">PrintxBaby</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 hover:bg-black/5"
                aria-label="Menüyü kapat"
              >
                <X size={20} />
              </button>
            </div>
            <NavLinks />
            <div className="mt-auto border-t border-border px-4 pt-4">
              <p className="mb-2 truncate text-xs text-muted">{userEmail}</p>
              <form action={signOut}>
                <button type="submit" className="btn-ghost w-full justify-start gap-2 text-sm">
                  <LogOut size={16} /> Çıkış Yap
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
