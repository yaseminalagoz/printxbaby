import type { LedOption, OrderSize, PricingRow } from "./types";

export const DEFAULT_PRICING: PricingRow[] = [
  { size: "30", led: "ledli", price: 1000 },
  { size: "30", led: "ledsiz", price: 800 },
  { size: "35", led: "ledli", price: 1300 },
  { size: "35", led: "ledsiz", price: 1100 },
  { size: "40", led: "ledli", price: 1600 },
  { size: "40", led: "ledsiz", price: 1400 },
];

export function getPrice(
  pricing: PricingRow[],
  size: OrderSize,
  led: LedOption
): number {
  const row = pricing.find((p) => p.size === size && p.led === led);
  return row?.price ?? 0;
}

export function formatTL(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}
