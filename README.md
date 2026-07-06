# JBRENDYR.COM - Premium Gaming Marketplace

Platform marketplace jual beli akun game premium (Mobile Legends, Valorant, Free Fire, dll.) berkinerja tinggi, aman, dan sangat ramah SEO (SEO Friendly). Dibangun menggunakan arsitektur modern Next.js 15 App Router dan Supabase Backend-as-a-Service.

---

## 🚀 Fitur Utama & Keunggulan

### Untuk Pembeli:
* **Desain Gaming Premium:** Antarmuka gelap (Dark Mode) elegan dengan aksen merah putih `#FF2B3C`, animasi halus (Framer Motion), dan responsif penuh di semua perangkat.
* **Pencarian & Filter Real-time:** Pencarian super cepat berdasarkan nama, rank, skin, atau deskripsi akun, disinkronkan langsung dengan parameter URL (mudah dibagikan).
* **Konversi WhatsApp Tinggi:** Tombol "ORDER VIA WHATSAPP" yang melayang di perangkat seluler dengan pembuat pesan otomatis dinamis berisi detail harga, judul, dan tautan produk.
* **FAQ & Testimoni Terintegrasi:** Membangun kepercayaan pembeli secara langsung di halaman utama.

### Untuk Administrator (Tanpa Coding):
* **Dashboard Statistik:** Grafik grafik harian (pengunjung & konversi klik WA) dan ringkasan data produk (Tersedia / Terjual).
* **Pengelolaan Konten (CRUD) Lengkap:** Tambah/ubah/hapus akun game, banner promosi slider, ulasan testimoni, daftar kategori game, dan bank FAQ.
* **Unggah Gambar Mudah:** Terintegrasi langsung dengan Supabase Storage untuk pratinjau thumbnail dan galeri tangkapan layar produk.
* **Pengaturan Kredensial Rahasia:** Kolom akun/login diamankan dan di-mask (hanya terlihat oleh admin pengelola).
* **Pengaturan Fleksibel:** Ubah nomor kontak WhatsApp, logo, tagline, nama web, dan kata kunci SEO instan tanpa membuka source code.

---

## 🛠️ Stack Teknologi

* **Frontend Framework:** Next.js 15 (App Router) + TypeScript + React 19
* **Styling & Icons:** TailwindCSS v4 + Lucide React
* **Backend Suite:** Supabase (PostgreSQL Database, Auth, Storage)
* **State & Validation:** Zustand (Client Filters) + Zod & React Hook Form
* **Animations:** Framer Motion (Transisi Galeri & Banners Slider)
* **Analytics Engine:** Chart.js + React Chartjs 2 (Dashboard Charts)

---

## ⚙️ Persyaratan Sistem & Instalasi Lokal

### 1. Prasyarat (Prerequisites)
Pastikan perangkat Anda telah terinstal:
* **Node.js** (Rekomendasi v18.0 atau lebih baru)
* **NPM** (Bawaan Node.js)

### 2. Kloning & Instalasi Dependensi
Jalankan perintah berikut di terminal Anda:
```bash
# Masuk ke direktori proyek
cd "WEB JBRENDY R"

# Instal seluruh package dependensi
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Buka file `.env.local` dan masukkan kredensial API Supabase Anda (Detail langkah pembuatan di bawah).

### 4. Menjalankan Server Pengembangan (Lokal)
Jalankan perintah berikut untuk menyalakan server lokal:
```bash
npm run dev
```
Website dapat diakses di browser melalui tautan: `http://localhost:3000`

---

## ☁️ Panduan Konfigurasi Supabase Cloud

Lakukan langkah berikut di dashboard Supabase Anda (`https://database.supabase.com`):

### Langkah 1: Setup Skema Database SQL
1. Buka proyek Supabase Anda.
2. Masuk ke menu **SQL Editor** di bilah navigasi kiri.
3. Klik **New Query**, lalu salin dan tempel isi file dari: `supabase/schema.sql`.
4. Klik **Run** untuk mengeksekusi pembuatan tabel, relasi foreign key, RLS policies, trigger pendaftaran, serta inisialisasi data seed (kategori, FAQ default, dan settings).

### Langkah 2: Setup Storage Bucket (Unggah Gambar)
1. Masuk ke menu **Storage** di bilah navigasi kiri Supabase.
2. Klik **Create a New Bucket**.
3. Beri nama bucket: `marketplace` (Wajib menggunakan huruf kecil dan nama yang sama persis).
4. Centang opsi **Public Bucket** agar gambar produk dan banner dapat diakses oleh browser pengunjung secara umum.
5. Klik **Save**.
6. Atur kebijakan akses kebijakan (Policies) Storage di menu *Policies*:
   * Izinkan tindakan **Select** untuk publik (Anonymous).
   * Izinkan tindakan **Insert / Update / Delete** untuk pengguna terautentikasi (Authenticated Users) agar admin dapat mengunggah gambar dari dashboard.

### Langkah 3: Membuat Akun Admin Pertama
1. Masuk ke menu **Authentication** -> **Users** di Supabase.
2. Klik **Add User** -> **Create User**.
3. Masukkan Email dan Password untuk akun Admin Anda.
4. Setelah dibuat, akun tersebut secara otomatis akan memicu fungsi database trigger `handle_new_user()` yang mendaftarkan UUID barunya ke tabel `public.profiles` dengan peran default `admin`.
5. Anda sekarang siap login di halaman: `http://localhost:3000/admin/login`

---

## 🌍 Panduan Deployment Dewaweb Hosting

Dewaweb mendukung hosting aplikasi Node.js baik melalui **cPanel (Node.js Selector)** untuk paket shared hosting, maupun **Cloud VPS** untuk kontrol penuh. Berikut adalah panduannya:

### Opsi A: Deployment di cPanel Dewaweb (Node.js Selector)

1. **Lakukan Build Lokal:**
   Jalankan build produksi di komputer lokal Anda untuk membuat direktori `.next` yang terkompilasi:
   ```bash
   npm run build
   ```
2. **Kemas File Proyek:**
   Kemas seluruh file proyek menjadi format `.zip` (Kecuali folder `node_modules` dan `.git` untuk menghemat ruang). Pastikan folder tersembunyi seperti `.next` ikut terkompresi.
3. **Unggah ke File Manager:**
   Buka cPanel Dewaweb Anda, masuk ke **File Manager**, lalu unggah file `.zip` tadi ke direktori utama (biasanya sejajar dengan `public_html` atau buat subfolder khusus). Ekstrak file tersebut.
4. **Buat Aplikasi Node.js di cPanel:**
   * Di dashboard cPanel, cari dan buka menu **Setup Node.js App**.
   * Klik **Create Application**.
   * Pilih **Node.js Version** (Rekomendasi versi terbaru, min v18+).
   * Pilih **Application Mode** menjadi `Production`.
   * Isi **Application root** dengan lokasi folder tempat mengekstrak file tadi (misal: `jbrendyr-app`).
   * Isi **Application URL** dengan domain Anda (`jbrendyr.com` atau subdomain).
   * Isi **Application startup file** dengan: `node_modules/next/dist/bin/next` (Ini mengarahkan startup langsung ke engine Next.js).
   * Klik **Create**.
5. **Tambahkan Environment Variables:**
   Di halaman pengaturan aplikasi Node.js cPanel tersebut, scroll ke bawah ke bagian **Environment variables**. Tambahkan variabel berikut satu per satu sesuai kredensial Supabase Anda:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
6. **Jalankan NPM Install:**
   * Klik tombol **Run JS Script** lalu pilih `npm install` (atau masuk ke SSH terminal cPanel Anda, ketik `source /home/username/nodevenv/.../bin/activate` lalu jalankan `npm install`).
7. **Jalankan Aplikasi:**
   * Klik **Restart** di panel cPanel Node.js Selector. Aplikasi Next.js Anda kini live di domain `jbrendyr.com`!

### Opsi B: Deployment di Dewaweb Cloud VPS (Rekomendasi untuk Kecepatan Maksimal)

1. **Persiapan Server:**
   Instal Node.js dan PM2 (Process Manager) di VPS Linux Anda (Ubuntu/Debian):
   ```bash
   # Instal Node.js (via NodeSource)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Instal PM2 secara global
   sudo npm install -g pm2
   ```
2. **Kloning Proyek & Setup Environment:**
   Hubungkan server VPS ke repository Git Anda atau unggah file via SFTP. Jalankan `npm install`. Buat file `.env.local` di direktori proyek VPS Anda dan isi kredensial Supabase.
3. **Build Aplikasi:**
   Jalankan perintah berikut di server VPS:
   ```bash
   npm run build
   ```
4. **Jalankan dengan PM2:**
   Gunakan PM2 untuk menjaga proses server Next.js tetap hidup di latar belakang:
   ```bash
   pm2 start npm --name "jbrendyr-marketplace" -- start -- -p 3000
   
   # Simpan proses agar otomatis berjalan saat server VPS reboot
   pm2 save
   pm2 startup
   ```
5. **Konfigurasi Reverse Proxy (Nginx):**
   Instal Nginx untuk mengarahkan lalu lintas port 80/443 (HTTP/HTTPS) domain Anda ke Next.js yang berjalan di port 3000:
   ```nginx
   server {
       listen 80;
       server_name jbrendyr.com www.jbrendyr.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Instal SSL Cert menggunakan Let's Encrypt Certbot untuk keamanan transaksi HTTPS.

---

## 📈 Rekomendasi SEO & Kinerja (Performance)

* **Skema Rich Snippet (JSON-LD):** Halaman detail produk secara otomatis menyuntikkan skema produk terstruktur. Ini memungkinkan Google menampilkan informasi harga dan ketersediaan langsung di hasil pencarian Google.
* **Robots.txt & Sitemap.xml:** Halaman sitemap dinamis `/sitemap.xml` otomatis ter-update saat Anda menambahkan akun game baru di dashboard. Robots.txt melarang robot Google mengindeks file API dan folder `/admin`.
* **Optimasi LCP & CLS:** Seluruh aset gambar eksternal di-render menggunakan Next.js `<Image>` dengan rasio aspek tetap, mencegah terjadinya pergeseran tata letak halaman (Cumulative Layout Shift) saat dimuat.
