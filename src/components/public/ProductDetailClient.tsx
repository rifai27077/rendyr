'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, MessageSquare, Share2, Sparkles, Sword, Award, ArrowLeft, Send } from 'lucide-react';
import { formatPrice, cleanWhatsAppNumber, trackAnalytics } from '@/lib/utils';
import { SiteSettings } from '@/lib/settings';
import ProductCard, { Product } from '@/components/public/ProductCard';

interface ProductDetailClientProps {
  product: Product & {
    description: string;
    gallery: string[];
    rank?: string | null;
    skin?: string | null;
    hero?: string | null;
  };
  settings: SiteSettings;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, settings, relatedProducts }: ProductDetailClientProps) {
  // Use gallery screenshots if available; otherwise, fall back to the thumbnail
  const images = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.thumbnail].filter(Boolean);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Send page view analytics tracker on mount
  useEffect(() => {
    trackAnalytics('page_view', product.id);
  }, [product.id]);

  const isReady = product.status === 'ready';

  // Handle WhatsApp Order checkout click
  const handleOrder = async () => {
    // Send background analytics click tracking
    trackAnalytics('whatsapp_click', product.id);

    // Format WA message
    const formattedPrice = formatPrice(product.price);
    const productUrl = `${window.location.origin}/product/${product.slug}`;
    const cleanPhone = cleanWhatsAppNumber(settings.whatsapp_number);
    
    const message = `Halo Admin ${settings.site_name}\n\nSaya tertarik membeli akun berikut:\n\nNama Produk: ${product.name}\nGame: ${product.game_name}\nHarga: ${formattedPrice}\nLink Produk: ${productUrl}\n\nMohon informasi lebih lanjut. Terima kasih!`;
    const encodedMessage = encodeURIComponent(message);
    
    // Redirect to WhatsApp
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  // Copy product link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto flex-grow">
      {/* Back button */}
      <Link
        href="/catalog"
        className="inline-flex items-center space-x-2 text-sm text-muted-gray hover:text-primary mb-8 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Kembali ke Katalog</span>
      </Link>

      {/* Product Detail Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
        
        {/* LEFT COLUMN: HIGH-RES SCREENSHOT GALLERY (5 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative w-full aspect-video bg-secondary rounded-2xl overflow-hidden border border-custom-border shadow-xl">
            {/* Status tag */}
            <div className="absolute top-4 left-4 z-10">
              <span
                className={`text-xs font-extrabold tracking-wider uppercase px-3 py-1.5 rounded-lg border ${
                  isReady
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-sold/20 text-sold border-sold/30'
                }`}
              >
                {isReady ? 'Tersedia' : 'Terjual'}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative w-full h-full"
              >
                <Image
                  src={images[activeImageIndex]}
                  alt={`${product.name} - View ${activeImageIndex + 1}`}
                  fill
                  priority
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto py-2 no-scrollbar">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative w-20 sm:w-24 aspect-video rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    activeImageIndex === index
                      ? 'border-primary scale-[1.03] shadow-md shadow-primary/10'
                      : 'border-custom-border/60 hover:border-primary/50'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Spech details & CTA Buy (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Specs */}
          <div className="space-y-2">
            <span className="text-xs text-primary font-bold tracking-widest uppercase bg-primary/10 border border-primary/25 rounded-md px-2.5 py-1 inline-block">
              {product.game_name}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center space-x-4 pt-1 text-xs text-muted-gray">
              <span>Status: <span className={isReady ? 'text-primary font-bold' : 'text-sold font-bold'}>{isReady ? 'Tersedia' : 'Terjual'}</span></span>
              <span>•</span>
              <span>Dilihat: <span className="text-white font-bold">{product.views || 0} kali</span></span>
            </div>
          </div>

          {/* Price Box */}
          <div className="bg-secondary/40 border border-custom-border p-5 rounded-2xl flex flex-col justify-center">
            <span className="text-xs text-muted-gray uppercase font-semibold block mb-1.5">Harga Akun</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>



          {/* WhatsApp Order Button & Share Module */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleOrder}
              disabled={!isReady}
              className={`flex-grow py-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2.5 transition-all duration-300 shadow-xl cursor-pointer ${
                isReady
                  ? 'bg-primary hover:bg-primary-dark text-white shadow-primary/10 pulsing-btn active:scale-[0.98]'
                  : 'bg-muted-gray/20 text-muted-gray border border-custom-border cursor-not-allowed'
              }`}
            >
              <Send className="h-5 w-5 fill-current" />
              <span>{isReady ? 'ORDER VIA WHATSAPP' : 'AKUN TELAH TERJUAL'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-5 py-4 rounded-xl border border-custom-border hover:border-primary hover:text-primary text-white font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all shrink-0 cursor-pointer"
              title="Salin tautan akun"
            >
              <Share2 className="h-5 w-5" />
              <span>{isCopied ? 'Tersalin' : 'Bagikan'}</span>
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start space-x-3 text-xs text-muted-gray">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Jaminan Keamanan JBRENDYR</span>
              <p>Transaksi dilindungi rekening bersama internal. Penjual diverifikasi dan data akun dijamin aman anti-hackback selama 30 hari.</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS: Description, Cara Beli, Garansi */}
      <div className="space-y-8 mb-20">
        {/* Description Column (Full width 12 cols) */}
        <div className="bg-secondary/20 border border-custom-border p-6 sm:p-8 rounded-2xl space-y-6 w-full">
          <h2 className="font-extrabold text-lg text-white border-l-3 border-primary pl-3">
            Deskripsi Lengkap Akun
          </h2>
          <div
            className="text-sm sm:text-base text-muted-gray leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>

        {/* Trade Process Column (Full width 12 cols, layout in 4 columns) */}
        <div className="bg-secondary/20 border border-custom-border p-6 sm:p-8 rounded-2xl space-y-6 w-full">
          <h2 className="font-extrabold text-base text-white border-l-3 border-primary pl-3 uppercase tracking-wide">
            Cara Transaksi
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-muted-gray leading-relaxed">
            <li className="bg-secondary/10 border border-custom-border/50 p-4 rounded-xl">
              <span className="text-white font-bold block mb-1">1. Kirim Orderan WA</span>
              Klik tombol hijau "ORDER VIA WHATSAPP", Anda akan dialihkan ke chat Admin resmi secara otomatis.
            </li>
            <li className="bg-secondary/10 border border-custom-border/50 p-4 rounded-xl">
              <span className="text-white font-bold block mb-1">2. Konfirmasi & Bayar</span>
              Admin akan mengirim rincian transaksi & nomor rekening pembayaran (Bank transfer / QRIS).
            </li>
            <li className="bg-secondary/10 border border-custom-border/50 p-4 rounded-xl">
              <span className="text-white font-bold block mb-1">3. Proses Verifikasi</span>
              Admin mengamankan & menampung data login akun dari penjual, serta memverifikasi isinya.
            </li>
            <li className="bg-secondary/10 border border-custom-border/50 p-4 rounded-xl">
              <span className="text-white font-bold block mb-1">4. Serah Terima Akun</span>
              Admin menyerahkan data login baru kepada Anda & membimbing pengamanan email/password. Selesai!
            </li>
          </ol>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8 border-t border-custom-border/50 pt-16">
          <div>
            <span className="text-xs text-primary uppercase font-bold tracking-widest block mb-2">Rekomendasi Lain</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Akun Game Serupa</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <div key={prod.id} className="h-full">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
