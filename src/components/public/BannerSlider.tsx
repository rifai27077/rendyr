'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string | null;
}

interface BannerSliderProps {
  banners: Banner[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 6000); // Change slides every 6s

    return () => clearInterval(interval);
  }, [currentIndex, banners.length]);

  if (!banners || banners.length === 0) {
    // Return a default gaming banner placeholder if no banners exist in DB
    return (
      <div className="relative w-full h-[220px] sm:h-[350px] md:h-[480px] bg-secondary rounded-2xl overflow-hidden border border-custom-border flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-secondary/70 to-dark/50 z-10" />
        <div className="relative z-20 text-center px-4 max-w-2xl">
          <h2 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight">
            SOLUSI PALING TEPAT JUAL BELI AKUN GAME
          </h2>
          <p className="text-xs sm:text-sm text-primary font-semibold tracking-wider uppercase mb-4 sm:mb-6">
            Aman • Murah • Terpercaya • Proses Cepat
          </p>
          <Link
            href="/catalog"
            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-dark font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-primary/20 active:scale-95 inline-block cursor-pointer"
          >
            Cari Akun Impian
          </Link>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const currentBanner = banners[currentIndex];

  const BannerContent = () => (
    <div className="relative w-full h-full">
      {/* Banner image - use regular img for external URLs from backend API */}
      <img
        src={currentBanner.image_url}
        alt={currentBanner.title}
        className="w-full h-full object-cover"
      />
      {/* Premium dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/40 to-transparent z-10" />

      {/* Floating text elements */}
      <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center px-6 sm:px-12 md:px-20 max-w-xl sm:max-w-2xl">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg sm:text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight drop-shadow-md"
        >
          {currentBanner.title}
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xs sm:text-sm text-primary font-bold tracking-wider uppercase mb-4 sm:mb-6"
        >
          AKUN GAME PREMIUM PILIHAN TERBAIK
        </motion.p>
        
        {currentBanner.link_url && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Link
              href={currentBanner.link_url}
              className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-dark font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-primary/20 active:scale-95 inline-block cursor-pointer"
            >
              Lihat Detail
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[220px] sm:h-[350px] md:h-[480px] bg-secondary rounded-2xl overflow-hidden border border-custom-border shadow-2xl group">
      {/* Slider view container */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
          }}
          className="absolute inset-0 w-full h-full"
        >
          {currentBanner.link_url ? (
            <Link href={currentBanner.link_url} className="block w-full h-full cursor-pointer">
              <BannerContent />
            </Link>
          ) : (
            <BannerContent />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows (Visible on Desktop hover) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-dark/60 hover:bg-primary hover:text-dark text-white border border-custom-border hover:border-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-dark/60 hover:bg-primary hover:text-dark text-white border border-custom-border hover:border-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Progress Dots indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-primary w-6' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
