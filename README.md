# PrintxBaby — Sipariş & Üretim Takip Sistemi

Next.js 14 (App Router) + TypeScript + Supabase ile geliştirilmiş, mobil/tablet/masaüstünde
responsive çalışan sipariş ve üretim takip uygulaması.

## İçerik

- Müşteri yönetimi (ekle / düzenle / sil / ara)
- Sipariş yönetimi (ürün detayları, tasarım görseli yükleme, otomatik fiyat hesaplama)
- 8 aşamalı üretim takibi (kanban görünümü + sipariş detayında durum değiştirme)
- Otomatik teslim tarihi (Sipariş Tarihi + 20 gün) ve kalan gün sayacı
- Ödeme takibi (kapora / kalan ödeme / IBAN-Shopier-Nakit)
- Dashboard: 9 özet kart + Uyarılar (7 gün / 3 gün / geciken) + Hızlı Kargo paneli
- Günlük Üretim Listesi (öncelik: Hızlı Kargo → Acil → Yaklaşan → Normal)
- Fiyat ayarları ekranı (6 sabit fiyatı panelden güncelleme)

## Kurulum (Mac)

### 1. Gereksinimler
- Node.js 18 veya üzeri (`node -v` ile kontrol edin)
- Ücretsiz bir [Supabase](https://supabase.com) hesabı

### 2. Bağımlılıkları yükleyin
```bash
cd printxbaby
npm install
```

### 3. Supabase projesi oluşturun
1. [supabase.com](https://supabase.com) üzerinde yeni bir proje oluşturun.
2. Sol menüden **SQL Editor**'ı açın, `supabase/schema.sql` dosyasının tüm içeriğini yapıştırıp
   **Run** ile çalıştırın. Bu işlem tüm tabloları, enum tiplerini, trigger'ları, RLS
   politikalarını ve `design-images` storage bucket'ını otomatik olarak oluşturur.
3. Sol menüden **Authentication > Users** kısmına gidip kendinize (veya ekibinize) e-posta /
   şifre ile bir kullanıcı oluşturun. Sisteme bu hesapla giriş yapılacak.
4. Sol menüden **Project Settings > API** kısmından `Project URL` ve `anon public` anahtarını
   not alın.

### 4. Ortam değişkenleri
`.env.local.example` dosyasını `.env.local` olarak kopyalayıp Supabase bilgilerinizi girin:
```bash
cp .env.local.example .env.local
```
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

### 5. Uygulamayı çalıştırın
```bash
npm run dev
```
Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın, oluşturduğunuz
kullanıcı bilgileriyle giriş yapın.

### 6. iPhone / iPad'den kullanım
Aynı ağdaysanız Mac'inizin yerel IP adresi üzerinden (`npm run dev` çalışırken terminalde
görünen `Network:` adresi, örn. `http://192.168.1.x:3000`) iPhone/iPad'den tarayıcı ile
erişebilirsiniz. Uzaktan/her yerden erişim için projeyi [Vercel](https://vercel.com) gibi bir
servise deploy edip (`vercel` komutu veya GitHub bağlantısı ile, aynı `.env` değişkenlerini
oradaki proje ayarlarına ekleyerek) yayınlamanız önerilir — bu, ek bir maliyet gerektirmeden
mevcut Supabase projenizle birlikte çalışır.

## Proje Yapısı

```
printxbaby/
├── supabase/schema.sql        → Veritabanı şeması (SQL Editor'da çalıştırılacak)
├── app/
│   ├── login/                 → Giriş ekranı
│   └── (app)/                 → Giriş yapılmış kullanıcıya açık ekranlar
│       ├── page.tsx           → Dashboard
│       ├── daily-list/        → Günlük Üretim Listesi
│       ├── production/        → Üretim Takip (kanban)
│       ├── orders/            → Sipariş listesi, yeni sipariş, detay, düzenleme
│       ├── customers/         → Müşteri listesi, yeni müşteri, detay
│       └── settings/pricing/  → Fiyat ayarları
├── components/                → Paylaşılan UI bileşenleri
├── lib/                       → Supabase istemcileri, server action'lar, yardımcı fonksiyonlar
└── middleware.ts              → Oturum kontrolü / yönlendirme
```

## Notlar
- Tüm veri işlemleri Next.js **Server Actions** ile yapılır (ayrı bir API katmanı yoktur).
- Yetkilendirme: Supabase Auth (e-posta/şifre). Giriş yapan her kullanıcı tüm verilere erişebilir
  (küçük ekip senaryosu). Daha sıkı yetkilendirme gerekiyorsa `supabase/schema.sql` içindeki RLS
  politikaları güncellenebilir.
- Fiyatlar `pricing` tablosunda tutulur ve `/settings/pricing` ekranından değiştirilebilir;
  yeni siparişler oluşturulduğu anda güncel fiyat otomatik çekilir.
- Teslim tarihi veritabanında **generated column** olarak (`order_date + 20`) hesaplanır,
  manuel güncellenemez/bozulamaz.
