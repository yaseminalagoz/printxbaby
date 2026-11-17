// Veritabanı enum tipleri (supabase/schema.sql ile birebir eşleşir)

export type OrderSize = "25" | "30" | "35" | "40";
export type LedOption = "ledli" | "ledsiz";

export type ProductionStatus =
  | "tasarim_bekliyor"
  | "tasarim_onay_bekliyor"
  | "baski_sirasinda"
  | "baski_tamamlandi"
  | "montaj_asamasinda"
  | "hazir"
  | "kargoya_verildi"
  | "teslim_edildi";

export type DeliveryType = "normal" | "acil" | "hizli_kargo";
export type PaymentMethod = "iban" | "shopier" | "nakit";
export type PaymentStatus = "odenmedi" | "kapora_alindi" | "tamamlandi";

export interface Customer {
  id: string;
  full_name: string;
  phone: string | null;
  instagram_username: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_no: number;
  customer_id: string;

  name: string;
  second_name: string | null;
  size: OrderSize;
  led: LedOption;
  model: string | null;
  main_letter: string | null;
  letter_color: string | null;
  name_color: string | null;
  decoration_color: string | null;
  extra_figures: string | null;
  design_images: string[];

  order_date: string;
  delivery_date: string;
  delivery_type: DeliveryType;

  production_status: ProductionStatus;
  shipped_at: string | null;
  delivered_at: string | null;

  total_price: number;
  deposit_amount: number;
  deposit_method: PaymentMethod | null;
  remaining_paid_amount: number;
  remaining_paid_method: PaymentMethod | null;
  remaining_paid_at: string | null;
  total_paid: number;
  remaining_payment: number;
  payment_status: PaymentStatus;

  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithCustomer extends Order {
  customer: Customer;
}

export interface PricingRow {
  size: OrderSize;
  led: LedOption;
  price: number;
}

export const PRODUCTION_STATUS_LABELS: Record<ProductionStatus, string> = {
  tasarim_bekliyor: "Tasarım Bekliyor",
  tasarim_onay_bekliyor: "Tasarım Onay Bekliyor",
  baski_sirasinda: "Baskı Sırasında",
  baski_tamamlandi: "Baskı Tamamlandı",
  montaj_asamasinda: "Montaj Aşamasında",
  hazir: "Hazır",
  kargoya_verildi: "Kargoya Verildi",
  teslim_edildi: "Teslim Edildi",
};

export const PRODUCTION_STATUS_ORDER: ProductionStatus[] = [
  "tasarim_bekliyor",
  "tasarim_onay_bekliyor",
  "baski_sirasinda",
  "baski_tamamlandi",
  "montaj_asamasinda",
  "hazir",
  "kargoya_verildi",
  "teslim_edildi",
];

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  normal: "Normal",
  acil: "Acil",
  hizli_kargo: "Hızlı Kargo",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  iban: "IBAN",
  shopier: "Shopier",
  nakit: "Nakit",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  odenmedi: "Ödenmedi",
  kapora_alindi: "Kapora Alındı",
  tamamlandi: "Tamamlandı",
};

export const ORDER_SIZE_LABELS: Record<OrderSize, string> = {
  "25": "25 cm",
  "30": "30 cm",
  "35": "35 cm",
  "40": "40 cm",
};

export const LED_LABELS: Record<LedOption, string> = {
  ledli: "Ledli",
  ledsiz: "Ledsiz",
};
