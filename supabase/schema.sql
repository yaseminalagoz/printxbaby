-- ============================================================================
-- PrintxBaby - Sipariş & Üretim Takip Sistemi
-- Supabase / PostgreSQL Veritabanı Şeması
-- ============================================================================
-- Bu dosyayı Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın
-- (veya `supabase db push` ile migration olarak uygulayın).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUM TİPLERİ
-- ----------------------------------------------------------------------------

create type order_size as enum ('25', '30', '35', '40');           -- cm
create type led_option as enum ('ledli', 'ledsiz');

create type production_status as enum (
  'tasarim_bekliyor',
  'tasarim_onay_bekliyor',
  'baski_sirasinda',
  'baski_tamamlandi',
  'montaj_asamasinda',
  'hazir',
  'kargoya_verildi',
  'teslim_edildi'
);

create type delivery_type as enum ('normal', 'acil', 'hizli_kargo');

create type payment_method as enum ('iban', 'shopier', 'nakit');

create type payment_status as enum ('odenmedi', 'kapora_alindi', 'tamamlandi');

-- ----------------------------------------------------------------------------
-- MÜŞTERİLER
-- ----------------------------------------------------------------------------

create table customers (
  id                  uuid primary key default gen_random_uuid(),
  full_name           text not null,
  phone               text,
  instagram_username  text,
  address             text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_customers_full_name on customers using gin (full_name gin_trgm_ops);

-- trigram arama için (telefon/instagram aramasını da hızlandırır)
create extension if not exists pg_trgm;

-- ----------------------------------------------------------------------------
-- FİYAT TABLOSU (sabit fiyatlar, ileride panelden güncellenebilir)
-- ----------------------------------------------------------------------------

create table pricing (
  size      order_size not null,
  led       led_option not null,
  price     numeric(10,2) not null,
  primary key (size, led)
);

insert into pricing (size, led, price) values
  ('25', 'ledli',  1100),
  ('25', 'ledsiz',  800),
  ('30', 'ledli',  1400),
  ('30', 'ledsiz', 1100),
  ('35', 'ledli',  1700),
  ('35', 'ledsiz', 1400),
  ('40', 'ledli',  2000),
  ('40', 'ledsiz', 1700);

-- ----------------------------------------------------------------------------
-- SİPARİŞLER
-- ----------------------------------------------------------------------------

create table orders (
  id                      uuid primary key default gen_random_uuid(),
  order_no                bigserial unique,              -- müşteri/ekip için kısa sipariş no (#1024)

  customer_id             uuid not null references customers(id) on delete restrict,

  -- Ürün bilgileri
  name                    text not null,                 -- İsim
  second_name             text,                          -- İkinci İsim (opsiyonel)
  size                    order_size not null,           -- 30 / 35 / 40 cm
  led                     led_option not null,           -- ledli / ledsiz
  model                   text,
  main_letter             text,                          -- Ana Harf
  letter_color            text,                          -- Harf Rengi
  name_color              text,                          -- İsim Rengi
  decoration_color        text,                          -- Süsleme Rengi
  extra_figures           text,                          -- Ek Figürler
  design_images           text[] not null default '{}', -- Supabase Storage URL'leri

  -- Tarih & teslimat
  order_date              date not null default current_date,
  delivery_date           date generated always as (order_date + 20) stored,
  delivery_type           delivery_type not null default 'normal',

  -- Üretim durumu
  production_status       production_status not null default 'tasarim_bekliyor',
  shipped_at              date,
  delivered_at            date,

  -- Fiyat & ödeme
  total_price             numeric(10,2) not null,
  deposit_amount          numeric(10,2) not null default 0,
  deposit_method          payment_method,
  remaining_paid_amount   numeric(10,2) not null default 0,
  remaining_paid_method   payment_method,
  remaining_paid_at       date,

  total_paid              numeric(10,2) generated always as (deposit_amount + remaining_paid_amount) stored,
  remaining_payment       numeric(10,2) generated always as (total_price - (deposit_amount + remaining_paid_amount)) stored,
  payment_status          payment_status generated always as (
                             case
                               when (deposit_amount + remaining_paid_amount) <= 0 then 'odenmedi'::payment_status
                               when (deposit_amount + remaining_paid_amount) >= total_price then 'tamamlandi'::payment_status
                               else 'kapora_alindi'::payment_status
                             end
                           ) stored,

  notes                   text,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_orders_status on orders (production_status);
create index idx_orders_delivery_date on orders (delivery_date);
create index idx_orders_delivery_type on orders (delivery_type);
create index idx_orders_customer on orders (customer_id);
create index idx_orders_order_date on orders (order_date);

-- ----------------------------------------------------------------------------
-- ÜRETİM DURUM GEÇMİŞİ (her durum değişikliğini otomatik loglar)
-- ----------------------------------------------------------------------------

create table production_logs (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  status      production_status not null,
  changed_at  timestamptz not null default now()
);

create index idx_production_logs_order on production_logs (order_id);

-- ----------------------------------------------------------------------------
-- TRIGGER'LAR
-- ----------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_customers_updated_at
  before update on customers
  for each row execute function set_updated_at();

create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

create or replace function log_production_status_change()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into production_logs (order_id, status) values (new.id, new.production_status);
  elsif (new.production_status is distinct from old.production_status) then
    insert into production_logs (order_id, status) values (new.id, new.production_status);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_orders_status_log
  after insert or update on orders
  for each row execute function log_production_status_change();

-- ----------------------------------------------------------------------------
-- STORAGE (tasarım görselleri için bucket)
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('design-images', 'design-images', true)
on conflict (id) do nothing;

create policy "design_images_public_read"
  on storage.objects for select
  using (bucket_id = 'design-images');

create policy "design_images_auth_upload"
  on storage.objects for insert
  with check (bucket_id = 'design-images' and auth.role() = 'authenticated');

create policy "design_images_auth_delete"
  on storage.objects for delete
  using (bucket_id = 'design-images' and auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Tek işletme / küçük ekip senaryosu: giriş yapmış her kullanıcı tam yetkili.
-- ----------------------------------------------------------------------------

alter table customers enable row level security;
alter table orders enable row level security;
alter table pricing enable row level security;
alter table production_logs enable row level security;

create policy "customers_all_authenticated" on customers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "orders_all_authenticated" on orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "pricing_all_authenticated" on pricing
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "production_logs_all_authenticated" on production_logs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================================
-- ŞEMA SONU
-- ============================================================================
