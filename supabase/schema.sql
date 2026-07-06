-- =========================================================================
-- DATABASE SCHEMA FOR JBRENDYR.COM (SUPABASE POSTGRESQL)
-- =========================================================================

-- Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Linked to Supabase Auth users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text not null,
    role text not null default 'admin' check (role in ('super_admin', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CATEGORIES TABLE
create table public.categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    slug text not null unique,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PRODUCTS TABLE
create table public.products (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    game_name text not null,
    slug text not null unique,
    price bigint not null,
    thumbnail text not null,
    gallery text[] not null default '{}'::text[],
    description text not null,
    rank text,
    skin text,
    hero text,
    account_info text, -- Sensitive credentials (Admin-only)
    status text not null default 'ready' check (status in ('ready', 'sold_out')),
    category_id uuid references public.categories(id) on delete set null,
    views integer not null default 0,
    whatsapp_clicks integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. BANNERS TABLE
create table public.banners (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    image_url text not null,
    link_url text,
    order_num integer not null default 0,
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TESTIMONIALS TABLE
create table public.testimonials (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    avatar_url text,
    rating integer not null check (rating >= 1 and rating <= 5),
    review text not null,
    game_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. FAQ TABLE
create table public.faqs (
    id uuid primary key default uuid_generate_v4(),
    question text not null,
    answer text not null,
    order_num integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. SETTINGS TABLE
create table public.settings (
    id uuid primary key default uuid_generate_v4(),
    key text not null unique,
    value text not null,
    description text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. ANALYTICS DAILY TABLE
create table public.analytics_daily (
    date date primary key default current_date,
    page_views integer not null default 0,
    whatsapp_clicks integer not null default 0
);

-- =========================================================================
-- AUTOMATIC PROFILE CREATION ON USER SIGNUP (TRIGGER)
-- =========================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.settings enable row level security;
alter table public.analytics_daily enable row level security;

-- 1. Profiles Policies
create policy "Allow public read for profiles" on public.profiles for select using (true);
create policy "Allow all actions for authenticated users on profiles" on public.profiles for all using (auth.uid() = id);

-- 2. Categories Policies
create policy "Allow public read for categories" on public.categories for select using (true);
create policy "Allow write actions for authenticated users on categories" on public.categories for all using (
    exists (select 1 from public.profiles where id = auth.uid())
);

-- 3. Products Policies
create policy "Allow public read for ready products" on public.products for select using (true);
create policy "Allow write actions for authenticated users on products" on public.products for all using (
    exists (select 1 from public.profiles where id = auth.uid())
);

-- 4. Banners Policies
create policy "Allow public read for active banners" on public.banners for select using (is_active = true);
create policy "Allow all actions for authenticated users on banners" on public.banners for all using (
    exists (select 1 from public.profiles where id = auth.uid())
);

-- 5. Testimonials Policies
create policy "Allow public read for testimonials" on public.testimonials for select using (true);
create policy "Allow all actions for authenticated users on testimonials" on public.testimonials for all using (
    exists (select 1 from public.profiles where id = auth.uid())
);

-- 6. FAQs Policies
create policy "Allow public read for faqs" on public.faqs for select using (true);
create policy "Allow all actions for authenticated users on faqs" on public.faqs for all using (
    exists (select 1 from public.profiles where id = auth.uid())
);

-- 7. Settings Policies
create policy "Allow public read for settings" on public.settings for select using (true);
create policy "Allow all actions for authenticated users on settings" on public.settings for all using (
    exists (select 1 from public.profiles where id = auth.uid())
);

-- 8. Analytics Policies
create policy "Allow public write (insert/update) on analytics_daily" on public.analytics_daily for all using (true);
create policy "Allow all actions for authenticated users on analytics_daily" on public.analytics_daily for all using (
    exists (select 1 from public.profiles where id = auth.uid())
);

-- =========================================================================
-- DATABASE FUNCTIONS (RPC) FOR ATOMIC INCREMENTS
-- =========================================================================

-- Function to increment product views
create or replace function public.increment_product_views(prod_id uuid)
returns void as $$
begin
  update public.products
  set views = views + 1
  where id = prod_id;
end;
$$ language plpgsql security definer;

-- Function to increment product WA clicks
create or replace function public.increment_product_whatsapp(prod_id uuid)
returns void as $$
begin
  update public.products
  set whatsapp_clicks = whatsapp_clicks + 1
  where id = prod_id;
end;
$$ language plpgsql security definer;

-- =========================================================================
-- INITIAL SEED DATA
-- =========================================================================

-- Seed Categories with fixed UUIDs for referential integrity in product seeds
insert into public.categories (id, name, slug, description) values
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Mobile Legends', 'mobile-legends', 'Koleksi akun Mobile Legends: Bang Bang premium dan aman.'),
('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Free Fire', 'free-fire', 'Akun Free Fire sultan, bundle langka, dan skin senjata maksimal.'),
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Valorant', 'valorant', 'Akun Valorant premium, skin bundle lengkap, rank tinggi.'),
('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'PUBG Mobile', 'pubg-mobile', 'Akun PUBG Mobile terpercaya, skin senjata upgradeable, & set outifit langka.'),
('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Genshin Impact', 'genshin-impact', 'Akun Genshin Impact AR tinggi, karakter bintang 5 melimpah.'),
('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'Honor of Kings', 'honor-of-kings', 'Akun Honor of Kings, skin hero eksklusif terbaru.'),
('a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d', 'Clash of Clans', 'clash-of-clans', 'Akun Clash of Clans TH tinggi, base max, siap perang.'),
('b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e', 'Rental Akun', 'rental-akun', 'Layanan rental sewa akun game premium per jam/hari.');

-- Seed Settings
insert into public.settings (key, value, description) values
('whatsapp_number', '628123456789', 'Nomor kontak WhatsApp Admin untuk menerima order akun game.'),
('site_name', 'JBRENDYR.COM', 'Nama website marketplace.'),
('site_title', 'JBRENDYR.COM | Jual Beli Akun Game Premium Terpercaya', 'Judul utama website untuk SEO Meta Title.'),
('site_tagline', 'Marketplace Jual Beli Akun Game Aman dan Terpercaya', 'Tagline brand untuk dipajang di website.'),
('site_description', 'JBRENDYR.COM adalah marketplace jual beli akun game premium paling aman, murah, dan terpercaya di Indonesia. Dapatkan akun Mobile Legends, Free Fire, Valorant, PUBG, Genshin, & CoC impianmu sekarang!', 'Deskripsi lengkap meta tags SEO.'),
('site_keywords', 'jual beli akun game, akun mobile legends murah, akun free fire sultan, akun valorant premium, jbrendyr, marketplace game aman, beli akun mlbb, sewa akun game', 'Daftar kata kunci pencarian SEO.'),
('instagram_url', 'https://instagram.com/jbrendyr', 'Tautan profil Instagram resmi.'),
('tiktok_url', 'https://tiktok.com/@jbrendyr', 'Tautan profil TikTok resmi.'),
('facebook_url', 'https://facebook.com/jbrendyr', 'Tautan halaman Facebook resmi.'),
('discord_url', 'https://discord.gg/jbrendyr', 'Tautan server Discord resmi.'),
('email_support', 'support@jbrendyr.com', 'Alamat email bantuan pelanggan.'),
('address_info', 'Jakarta, Indonesia', 'Alamat fisik kantor/kantor operasional.');

-- Seed FAQs
insert into public.faqs (question, answer, order_num) values
('Bagaimana cara membeli akun game di JBRENDYR.COM?', '1. Cari dan pilih akun game yang ingin Anda beli.<br>2. Klik tombol "Order via WhatsApp".<br>3. Anda akan diarahkan ke chat WhatsApp Admin dengan pesan otomatis.<br>4. Admin akan memandu transaksi pembayaran dan penyerahan akun secara aman.', 1),
('Metode pembayaran apa saja yang didukung?', 'Kami mendukung pembayaran melalui transfer bank (BCA, Mandiri, BNI, BRI), e-wallet terpopuler (Dana, OVO, GoPay, LinkAja), serta scan QRIS otomatis.', 2),
('Apakah transaksi di website ini aman?', 'Tentu saja! Keamanan adalah prioritas utama kami. Kami menyediakan sistem rekening bersama (rekber) internal dan memberikan garansi uang kembali jika data akun tidak sesuai dengan yang diiklankan.', 3),
('Berapa lama proses serah terima akun?', 'Proses serah terima data login akun biasanya memakan waktu 5 hingga 15 menit setelah pembayaran Anda dikonfirmasi oleh Admin kami.', 4),
('Apakah ada garansi setelah akun dibeli?', 'Ya, kami menyediakan garansi keamanan akun selama 30 hari sejak tanggal pembelian terhadap risiko hackback atau pembatalan transaksi sepihak dari pemilik pertama.', 5);

-- Seed Products (Tester Free Fire and Mobile Legends Accounts)
insert into public.products (name, game_name, slug, price, thumbnail, description, rank, skin, hero, status, category_id) values
('Akun FF Sultan Evo Gun Max V1', 'Free Fire', 'akun-ff-sultan-evo-gun-max-v1', 1500000, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600', 'Akun Free Fire Sultan spesifikasi dewa. Memiliki Evo Gun skin terlengkap (AK-Blue Flame Draco Max, M1014-Green Flame Draco Max, MP40-Predatory Cobra Max). Bundle langka Cobra dan bundle Old Season lengkap. Akun login FB, aman 100% no minus.', 'Grandmaster', 'Evo Gun Max (AK, MP40, M1014)', 'Karakter Lengkap (Alok, Chrono max)', 'ready', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'),
('Akun FF Old Season 1 & 2 Legend', 'Free Fire', 'akun-ff-old-season-1-2-legend', 3500000, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600', 'Akun Free Fire super langka dari Season 1. Memiliki Sakura bundle (Season 1) dan Hip Hop bundle (Season 2). Banner old season aktif, tas kelinci old, dan koleksi senjata lengkap. Akun pribadi, jaminan aman seumur hidup.', 'Heroic', 'Sakura Bundle, Hip Hop Bundle', 'Karakter Old Lengkap', 'ready', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'),
('Akun FF Semi-Sultan Murah', 'Free Fire', 'akun-ff-semi-sultan-murah', 450000, 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600', 'Akun FF murah meriah tapi spesifikasi mantap. Memiliki skin MP40 Cobra level 4, bundle cobra set, dan emote cobra lengkap. Cocok untuk pemula yang ingin langsung main akun kece. Akun login Google.', 'Diamond IV', 'MP40 Cobra Lvl 4, Cobra Set', 'Alok, Kelly, Hayato', 'ready', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'),
('Akun MLBB Sultan 300+ Skin Cole', 'Mobile Legends', 'akun-mlbb-sultan-300-skin-cole', 1200000, 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600', 'Akun Mobile Legends Sultan dengan 300+ Skin. Collector skin (Gusion, Granger), skin Hero (Chou, Lancelot), dan skin KOF lengkap. Winrate mantap 68%+, MMR hero tinggi, emblem all max. Data aman 100% login Moonton clean.', 'Mythical Glory', '300+ Skin (Collector, Hero, KOF)', 'Semua Hero Terbuka', 'ready', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');

-- Seed Testimonials (Using user requested names)
insert into public.testimonials (name, rating, review, game_name) values
('RIZZXITERS SAJA', 5, 'Beli akun FF di sini bener-bener rekomen banget! Proses cepat cuma 5 menit langsung dapet data login lengkap. Admin nya juga ramah dan fast respon. Sukses terus JBRENDYR.COM!', 'Free Fire'),
('NIXKANAERU', 5, 'Gila sih, dapet akun MLBB sultan harga miring banget. Transaksi aman lewat admin escrow resmi. Gak usah ragu beli di sini!', 'Mobile Legends'),
('AMBATUKAM', 5, 'Prosesnya cepat sekali! Begitu konfirmasi pembayaran, langsung diserahterimakan akunnya. Sangat terpercaya!', 'Free Fire');
