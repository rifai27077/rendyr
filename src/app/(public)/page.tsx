import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getSettings } from '@/lib/settings';
import BannerSlider from '@/components/public/BannerSlider';
import ProductCard, { Product } from '@/components/public/ProductCard';
import TestimonialsGrid from '@/components/public/TestimonialsGrid';
import FAQAccordion from '@/components/public/FAQAccordion';
import WelcomePopup from '@/components/public/WelcomePopup';
import { ShieldCheck, Search, Zap, Clock, Star, Award, Info, CheckCircle } from 'lucide-react';

export const revalidate = 60; // Cache the page for 60 seconds (ISR)

import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '@/lib/default-products';

const DEFAULT_TESTIMONIALS = [
  {
    id: 't-1',
    name: 'RIZZXITERS SAJA',
    avatar_url: '',
    rating: 5,
    review: 'Beli akun FF di sini bener-bener rekomen banget! Proses cepat cuma 5 menit langsung dapet data login lengkap. Admin nya juga ramah dan fast respon. Sukses terus JBRENDYR.COM!',
    game_name: 'Free Fire',
    created_at: new Date().toISOString(),
  },
  {
    id: 't-2',
    name: 'NIXKANAERU',
    avatar_url: '',
    rating: 5,
    review: 'Gila sih, dapet akun MLBB sultan harga miring banget. Transaksi aman lewat admin escrow resmi. Gak usah ragu beli di sini!',
    game_name: 'Mobile Legends',
    created_at: new Date().toISOString(),
  },
  {
    id: 't-3',
    name: 'AMBATUKAM',
    avatar_url: '',
    rating: 5,
    review: 'Prosesnya cepat sekali! Begitu konfirmasi pembayaran, langsung diserahterimakan akunnya. Sangat terpercaya!',
    game_name: 'Free Fire',
    created_at: new Date().toISOString(),
  }
];

const DEFAULT_FAQS = [
  { id: 'f-1', question: 'Bagaimana cara membeli akun game di JBRENDYR.COM?', answer: '1. Cari dan pilih akun game yang ingin Anda beli.<br>2. Klik tombol "Order via WhatsApp".<br>3. Anda akan diarahkan ke chat WhatsApp Admin dengan pesan otomatis.<br>4. Admin akan memandu transaksi pembayaran dan penyerahan akun secara aman.', order_num: 1 },
  { id: 'f-2', question: 'Metode pembayaran apa saja yang didukung?', answer: 'Kami mendukung pembayaran melalui transfer bank (BCA, Mandiri, BNI, BRI), e-wallet terpopuler (Dana, OVO, GoPay, LinkAja), serta scan QRIS otomatis.', order_num: 2 },
  { id: 'f-3', question: 'Apakah transaksi di website ini aman?', answer: 'Tentu saja! Keamanan adalah prioritas utama kami. Kami menyediakan sistem rekening bersama (rekber) internal dan memberikan garansi uang kembali jika data akun tidak sesuai dengan yang diiklankan.', order_num: 3 }
];

// Data fetching helper
async function getHomeData() {
  try {
    const [bannersRes, categoriesRes, productsRes, testimonialsRes, faqsRes] = await Promise.all([
      supabase.from('banners').select('*').eq('is_active', true).order('order_num', { ascending: true }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('products').select('*').eq('status', 'ready').order('created_at', { ascending: false }).limit(8),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('faqs').select('*').order('order_num', { ascending: true }),
    ]);

    const categories = categoriesRes.data !== null ? categoriesRes.data : DEFAULT_CATEGORIES;
    const products = productsRes.data !== null ? productsRes.data : DEFAULT_PRODUCTS;
    const testimonials = testimonialsRes.data !== null ? testimonialsRes.data : DEFAULT_TESTIMONIALS;
    const faqs = faqsRes.data !== null ? faqsRes.data : DEFAULT_FAQS;

    return {
      banners: bannersRes.data || [],
      categories,
      products,
      testimonials,
      faqs,
    };
  } catch (error) {
    console.error('Error loading homepage data:', error);
    return { 
      banners: [], 
      categories: DEFAULT_CATEGORIES, 
      products: DEFAULT_PRODUCTS, 
      testimonials: DEFAULT_TESTIMONIALS, 
      faqs: DEFAULT_FAQS 
    };
  }
}

export default async function HomePage() {
  const { banners, categories, products, testimonials, faqs } = await getHomeData();
  const settings = await getSettings();

  // Organization Schema JSON-LD
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': settings.site_name,
    'url': 'https://jbrendyr.com',
    'logo': 'https://jbrendyr.com/favicon.ico',
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': `+${settings.whatsapp_number}`,
      'contactType': 'customer service',
    },
    'sameAs': [
      settings.instagram_url,
      settings.tiktok_url,
      settings.facebook_url,
    ].filter(Boolean),
  };

  return (
    <div className="flex-grow">
      <WelcomePopup />
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* 1. HERO SECTION & QUICK SEARCH */}
      <section className="relative pt-28 pb-24 md:py-32 px-4 sm:px-6 md:px-8 overflow-hidden">
        {/* Subtle grid & neon blob background decorations */}
        <div className="hero-blob-bg absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,43,60,0.08),transparent_50%)] z-0 pointer-events-none" />
        <div className="absolute -top-[20%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">

          {/* Banner Full Width */}
          <BannerSlider banners={banners} />

          {/* Content */}
          <div className="mt-10 flex flex-col items-center text-center">

            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="text-[10px] sm:text-xs text-primary font-bold uppercase tracking-wider">
                Spesialis Akun Sultan & Game Premium
              </span>
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-black text-white leading-tight">
              Miliki Akun{" "}
              <span className="text-primary">
                Game
              </span>{" "}
              Sultan
            </h1>

            <p className="mt-5 text-sm md:text-base text-muted-gray max-w-2xl">
              {settings.site_description}
            </p>

            <form
              action="/catalog"
              method="GET"
              className="mt-8 w-full max-w-xl relative group"
            >
              <input
                type="text"
                name="q"
                placeholder="Cari akun impian..."
                className="w-full pl-12 pr-32 py-4 rounded-xl bg-secondary border border-custom-border text-white focus:border-primary outline-none"
              />

              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-gray" />

              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition"
              >
                Cari
              </button>
            </form>

          </div>

        </div>
      </section>

      {/* 2. GAME CATEGORIES GRID */}
      <section className="py-16 bg-secondary/20 border-t border-b border-custom-border/50 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs text-primary uppercase font-bold tracking-widest block mb-2">Pilih Kategori</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Kategori Game Populer</h2>
            </div>
            <Link
              href="/catalog"
              className="text-xs sm:text-sm text-primary hover:text-primary-dark font-bold transition-colors inline-block"
            >
              Lihat Semua Game →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {[...categories]
              .sort((a, b) => {
                if (a.slug === 'free-fire') return -1;
                if (b.slug === 'free-fire') return 1;
                return a.name.localeCompare(b.name);
              })
              .map((cat) => {
                const isFreeFire = cat.slug === 'free-fire';
                return (
                  <Link
                    key={cat.id}
                    href={`/catalog?game=${cat.slug}`}
                    className={`relative bg-secondary/40 border rounded-xl p-4 text-center flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 group cursor-pointer ${
                      isFreeFire
                        ? 'border-primary shadow-[0_0_15px_rgba(255,43,60,0.15)] bg-secondary/80'
                        : 'border-custom-border hover:border-primary/80'
                    }`}
                  >
                    {isFreeFire && (
                      <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-primary text-white text-[8px] font-extrabold uppercase tracking-widest animate-pulse shadow-md shadow-primary/25">
                        HOT
                      </span>
                    )}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all ${
                      isFreeFire
                        ? 'bg-primary text-white'
                        : 'bg-primary/5 border border-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                    }`}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-white line-clamp-1 leading-snug">
                      {cat.name}
                    </h3>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* 3. LATEST PRODUCTS (PRODUK TERBARU) */}
      <section className="py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs text-primary uppercase font-bold tracking-widest block mb-2">Katalog Terbaru</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Rekomendasi Akun Siap Pakai</h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs sm:text-sm text-primary hover:text-primary-dark font-bold transition-colors inline-block"
          >
            Lihat Semua Akun →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod as unknown as Product} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-custom-border p-12 text-center rounded-2xl bg-secondary/20 max-w-lg mx-auto">
            <Award className="h-10 w-10 text-muted-gray mx-auto mb-4" />
            <h3 className="font-bold text-white text-base mb-1">Belum Ada Akun Game</h3>
            <p className="text-sm text-muted-gray">
              Saat ini produk belum tersedia. Hubungi admin atau periksa kembali nanti.
            </p>
          </div>
        )}
      </section>

      {/* 4. TRUST & FEATURES SECTION */}
      <section className="py-20 bg-secondary/30 border-t border-b border-custom-border/50 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs text-primary uppercase font-bold tracking-widest block mb-2">Mengapa Memilih Kami</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">Layanan Terbaik untuk Anda</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-secondary/40 border border-custom-border p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Jaminan Layanan</h3>
              <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                Keamanan dan kualitas layanan terjamin
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-secondary/40 border border-custom-border p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 mb-5">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Layanan 24 Jam</h3>
              <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                Layanan non-stop, 24 jam setiap hari
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-secondary/40 border border-custom-border p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 mb-5">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Pembayaran Aman & Terpercaya</h3>
              <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                Keamanan dan kualitas layanan terjamin
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-secondary/40 border border-custom-border p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Proses Cepat & Otomatis</h3>
              <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                Proses cepat, otomatis, tanpa hambatan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5. ABOUT SECTION */}
      <section className="py-20 bg-dark relative overflow-hidden px-4 sm:px-6 md:px-8 border-t border-custom-border/35">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-primary/3 blur-[130px] pointer-events-none" />
        <div className="max-w-6xl mx-auto glassmorphism border border-custom-border/80 rounded-3xl p-8 sm:p-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* About text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-primary">
                <Info className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Tentang JBRENDYR.COM</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Destinasi Utama Jual Beli Akun Game Premium Terpercaya
              </h2>
              <p className="text-sm text-muted-gray leading-relaxed">
                JBRENDYR.COM adalah platform marketplace terdepan di Indonesia yang berdedikasi tinggi menyediakan akun game premium siap pakai, dengan fokus utama pada **akun Free Fire Sultan** serta berbagai game populer seperti Mobile Legends, Valorant, PUBG Mobile, dan Genshin Impact.
              </p>
              <p className="text-sm text-muted-gray leading-relaxed">
                Didirikan dengan visi memberikan kenyamanan penuh bagi para gamer, kami menjamin keamanan transaksi 100% menggunakan sistem **Admin Escrow / Rekber Resmi**. Seluruh akun yang diiklankan telah melewati proses verifikasi data yang ketat oleh tim kami sebelum diserahterimakan ke pembeli.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-bold text-white">Garansi Hackback 30 Hari</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-bold text-white">Admin Escrow Profesional</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-bold text-white">Proses Instant 10 Menit</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-bold text-white">Beli Lewat WhatsApp Cepat</span>
                </div>
              </div>
            </div>

            {/* About Stats grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 border border-custom-border p-6 rounded-2xl text-center hover:border-primary/40 transition-colors">
                <span className="block text-3xl sm:text-4xl font-black text-primary mb-1">10K+</span>
                <span className="text-xs text-muted-gray font-bold uppercase tracking-wider font-semibold">Akun Terjual</span>
              </div>
              <div className="bg-secondary/50 border border-custom-border p-6 rounded-2xl text-center hover:border-primary/40 transition-colors">
                <span className="block text-3xl sm:text-4xl font-black text-white mb-1">99.9%</span>
                <span className="text-xs text-muted-gray font-bold uppercase tracking-wider font-semibold">Puas & Aman</span>
              </div>
              <div className="bg-secondary/50 border border-custom-border p-6 rounded-2xl text-center hover:border-primary/40 transition-colors">
                <span className="block text-3xl sm:text-4xl font-black text-white mb-1">5-15m</span>
                <span className="text-xs text-muted-gray font-bold uppercase tracking-wider font-semibold">Proses Serah</span>
              </div>
              <div className="bg-secondary/50 border border-custom-border p-6 rounded-2xl text-center hover:border-primary/40 transition-colors">
                <span className="block text-3xl sm:text-4xl font-black text-primary mb-1">24/7</span>
                <span className="text-xs text-muted-gray font-bold uppercase tracking-wider font-semibold">Layanan CS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs text-primary uppercase font-bold tracking-widest block mb-2">Ulasan Pembeli</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Apa Kata Mereka?</h2>
        </div>
        <TestimonialsGrid testimonials={testimonials} />
      </section>

      {/* 6. FAQ PREVIEW SECTION */}
      {faqs.length > 0 && (
        <section id="faq" className="py-20 bg-secondary/20 border-t border-custom-border/50 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs text-primary uppercase font-bold tracking-widest block mb-2">Tanya Jawab</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Pertanyaan Populer</h2>
            </div>
            
            <FAQAccordion faqs={faqs} />
          </div>
        </section>
      )}
    </div>
  );
}
