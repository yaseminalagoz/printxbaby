import { remainingDays } from "./dates";
import type { OrderWithCustomer } from "./types";

const ACTIVE_PRODUCTION: OrderWithCustomer["production_status"][] = [
  "baski_sirasinda",
  "baski_tamamlandi",
  "montaj_asamasinda",
];
const WAITING_DESIGN: OrderWithCustomer["production_status"][] = [
  "tasarim_bekliyor",
  "tasarim_onay_bekliyor",
];

export function computeDashboardStats(orders: OrderWithCustomer[]) {
  const now = new Date();
  const isThisMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  const notDelivered = orders.filter((o) => o.production_status !== "teslim_edildi");

  const bekleyenSiparisler = orders.filter((o) => WAITING_DESIGN.includes(o.production_status));
  const uretimdekiler = orders.filter((o) => ACTIVE_PRODUCTION.includes(o.production_status));
  const kargoyaHazirlar = orders.filter((o) => o.production_status === "hazir");
  const tamamlananlarBuAy = orders.filter(
    (o) => o.production_status === "teslim_edildi" && o.delivered_at && isThisMonth(o.delivered_at)
  );

  const buAykiCiro = orders
    .filter((o) => isThisMonth(o.order_date))
    .reduce((sum, o) => sum + Number(o.total_price), 0);

  const alinanKaporalar = orders
    .filter((o) => isThisMonth(o.order_date))
    .reduce((sum, o) => sum + Number(o.deposit_amount), 0);

  const bekleyenTahsilatlar = notDelivered.reduce(
    (sum, o) => sum + Math.max(0, Number(o.remaining_payment)),
    0
  );

  const yaklasanTeslimatlar = notDelivered.filter((o) => {
    const days = remainingDays(o.delivery_date);
    return days <= 7;
  });

  const gecikenSiparisler = notDelivered.filter((o) => remainingDays(o.delivery_date) < 0);
  const kritikSiparisler = notDelivered.filter((o) => {
    const d = remainingDays(o.delivery_date);
    return d >= 0 && d <= 3;
  });
  const yedigunSiparisler = notDelivered.filter((o) => {
    const d = remainingDays(o.delivery_date);
    return d > 3 && d <= 7;
  });

  const hizliKargoSiparisleri = notDelivered.filter((o) => o.delivery_type === "hizli_kargo");
  const acilSiparisler = notDelivered.filter((o) => o.delivery_type === "acil");

  return {
    bekleyenSiparisler,
    uretimdekiler,
    kargoyaHazirlar,
    tamamlananlarBuAy,
    buAykiCiro,
    alinanKaporalar,
    bekleyenTahsilatlar,
    yaklasanTeslimatlar,
    gecikenSiparisler,
    kritikSiparisler,
    yedigunSiparisler,
    hizliKargoSiparisleri,
    acilSiparisler,
    notDelivered,
  };
}

/** Günlük üretim listesi: Hızlı Kargo > Acil > Teslim Tarihi Yaklaşanlar > Normal */
export function buildDailyProductionList(orders: OrderWithCustomer[]) {
  const active = orders.filter((o) => o.production_status !== "teslim_edildi");

  function priorityScore(o: OrderWithCustomer): number {
    if (o.delivery_type === "hizli_kargo") return 0;
    if (o.delivery_type === "acil") return 1;
    const days = remainingDays(o.delivery_date);
    if (days <= 7) return 2;
    return 3;
  }

  return [...active].sort((a, b) => {
    const pa = priorityScore(a);
    const pb = priorityScore(b);
    if (pa !== pb) return pa - pb;
    return remainingDays(a.delivery_date) - remainingDays(b.delivery_date);
  });
}
