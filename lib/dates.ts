import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export const DELIVERY_DAYS = 20;

/** Sipariş tarihinden teslim tarihini hesaplar (DB tarafında da generated column olarak hesaplanır, bu fonksiyon yeni sipariş formunda önizleme için kullanılır). */
export function calculateDeliveryDate(orderDate: Date | string): Date {
  const base = typeof orderDate === "string" ? parseISO(orderDate) : orderDate;
  const result = new Date(base);
  result.setDate(result.getDate() + DELIVERY_DAYS);
  return result;
}

/** Teslim tarihine kalan gün sayısı. Negatifse sipariş gecikmiş demektir. */
export function remainingDays(deliveryDate: string | Date): number {
  const target = typeof deliveryDate === "string" ? parseISO(deliveryDate) : deliveryDate;
  return differenceInCalendarDays(target, new Date());
}

export type UrgencyLevel = "gecikti" | "kritik" | "yaklasiyor" | "normal";

/** Kalan güne göre aciliyet seviyesi: <0 gecikti, <=3 kritik, <=7 yaklaşıyor, diğer normal */
export function urgencyLevel(deliveryDate: string | Date): UrgencyLevel {
  const days = remainingDays(deliveryDate);
  if (days < 0) return "gecikti";
  if (days <= 3) return "kritik";
  if (days <= 7) return "yaklasiyor";
  return "normal";
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMMM yyyy", { locale: tr });
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMM yyyy", { locale: tr });
}

export function formatDateInput(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export function remainingDaysLabel(deliveryDate: string | Date): string {
  const days = remainingDays(deliveryDate);
  if (days < 0) return `${Math.abs(days)} gün gecikti`;
  if (days === 0) return "Bugün teslim";
  return `${days} gün kaldı`;
}
