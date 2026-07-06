'use client';

import { useState, useEffect } from 'react';
import { X, ShieldCheck, Home, Search, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check localStorage to see if the popup has been closed today
    const hasClosedToday = localStorage.getItem('welcome-popup-closed');
    const closedTime = localStorage.getItem('welcome-popup-closed-time');
    
    if (hasClosedToday && closedTime) {
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      if (now - Number(closedTime) < oneDay) {
        return; // Don't show
      }
    }
    
    // Show popup after a small delay (1.5 seconds) for premium feel
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (dontShowAgain) {
      localStorage.setItem('welcome-popup-closed', 'true');
      localStorage.setItem('welcome-popup-closed-time', String(new Date().getTime()));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-lg bg-secondary border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,43,60,0.15)] z-10 overflow-hidden"
          >
            {/* Red & White background glows */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-[40px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 blur-[40px] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-gray hover:text-white hover:bg-dark/50 transition-all cursor-pointer"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center space-y-5">
              {/* Shield badge/icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative">
                <ShieldCheck className="h-8 w-8 animate-pulse" />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Selamat Datang di <span className="text-primary">JBRENDYR.COM</span>
                </h2>
                <p className="text-xs text-muted-gray">
                  Panduan Navigasi & Keamanan Marketplace Akun Game Premium
                </p>
              </div>

              {/* Menu Details Box */}
              <div className="w-full bg-dark/60 border border-custom-border p-5 rounded-2xl text-left space-y-4">
                
                {/* Menu 1 */}
                <div className="flex items-start space-x-3.5">
                  <Home className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Halaman Utama (Home)</h3>
                    <p className="text-[11px] text-muted-gray leading-relaxed">
                      Menampilkan kategori game terpopuler (prioritas Free Fire), rekomendasi akun sultan pilihan, keunggulan jaminan transaksi, ulasan pembeli terpercaya, dan Tanya Jawab (FAQ).
                    </p>
                  </div>
                </div>

                {/* Menu 2 */}
                <div className="flex items-start space-x-3.5">
                  <Search className="h-5 w-5 text-white shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Katalog Akun (Catalog)</h3>
                    <p className="text-[11px] text-muted-gray leading-relaxed">
                      Sistem pencarian dan filter spesifik. Anda bisa memfilter berdasarkan jenis game, rentang harga, status ketersediaan, kata kunci skin/rank, serta mengurutkan harga termurah/termahal.
                    </p>
                  </div>
                </div>

                {/* Menu 3 */}
                <div className="flex items-start space-x-3.5">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Layanan Pembelian (WhatsApp Order)</h3>
                    <p className="text-[11px] text-muted-gray leading-relaxed">
                      Semua transaksi diarahkan otomatis ke kontak WhatsApp Admin untuk proses serah terima akun via sistem Escrow/Rekber internal kami secara aman, manual, dan transparan.
                    </p>
                  </div>
                </div>

              </div>

              {/* CTA Button */}
              <button
                onClick={handleClose}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-sm transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-98 cursor-pointer"
              >
                Mulai Jelajahi Halaman
              </button>

              {/* Don't show again checkbox */}
              <label className="flex items-center space-x-2 text-xs text-muted-gray hover:text-white transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-custom-border text-primary focus:ring-primary bg-dark/60 h-4 w-4"
                />
                <span>Jangan tampilkan panduan ini lagi untuk hari ini</span>
              </label>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
