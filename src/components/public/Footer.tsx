import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Disc } from 'lucide-react';
import { SiteSettings } from '@/lib/settings';

interface FooterProps {
  settings: SiteSettings;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Custom inline brand SVGs for maximum portability
  const InstagramIcon = () => (
    <svg
      className="h-5 w-5 fill-current"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051c-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg
      className="h-5 w-5 fill-current"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const TikTokIcon = () => (
    <svg
      className="h-5 w-5 fill-current"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.5-.18-.13-.35-.29-.52-.45v5.06c.02 2.3-.61 4.74-2.22 6.37-1.74 1.86-4.52 2.58-6.98 2.02-2.64-.54-4.89-2.58-5.63-5.18-.84-2.84-.04-6.22 2.06-8.23 1.69-1.68 4.29-2.3 6.6-1.57v4.04c-1.39-.52-3.09-.17-4.08.88-.93.94-1.12 2.51-.49 3.69.58 1.14 1.9 1.86 3.17 1.73 1.34-.05 2.51-1.09 2.64-2.43.08-1.28.02-2.57.04-3.86.01-4.74.01-9.48.01-14.22-.05-.09-.07-.15-.12-.22z" />
    </svg>
  );

  return (
    <footer className="bg-secondary border-t border-custom-border pt-16 pb-8 px-4 sm:px-6 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand Info Column */}
        <div className="flex flex-col space-y-4">
          <Link href="/" className="flex items-center space-x-2 group w-max">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-primary/20 bg-dark flex items-center justify-center p-1">
              <Image
                src="/logo.png"
                alt="JBRENDYR"
                width={32}
                height={32}
                className="object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
              {settings.site_name}
            </span>
          </Link>
          <p className="text-sm text-muted-gray leading-relaxed">
            {settings.site_tagline}. Platform terpercaya untuk transaksi jual beli akun game premium dengan jaminan aman, cepat, dan bergaransi.
          </p>
          {/* Social Media Row */}
          <div className="flex items-center space-x-4 pt-2">
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark border border-custom-border hover:border-primary hover:text-primary flex items-center justify-center transition-all text-muted-gray"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            )}
            {settings.tiktok_url && (
              <a
                href={settings.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark border border-custom-border hover:border-primary hover:text-primary flex items-center justify-center transition-all text-muted-gray"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </a>
            )}
            {settings.facebook_url && (
              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark border border-custom-border hover:border-primary hover:text-primary flex items-center justify-center transition-all text-muted-gray"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
            )}
            {settings.discord_url && (
              <a
                href={settings.discord_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark border border-custom-border hover:border-primary hover:text-primary flex items-center justify-center transition-all text-muted-gray"
                aria-label="Discord"
              >
                <Disc className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        {/* Peta Situs / Navigation */}
        <div className="flex flex-col space-y-4">
          <h3 className="font-bold text-white text-base tracking-wide uppercase border-l-2 border-primary pl-3">
            Peta Situs
          </h3>
          <div className="flex flex-col space-y-2.5 text-sm">
            <Link href="/" className="text-muted-gray hover:text-primary transition-colors">
              Halaman Utama
            </Link>
            <Link href="/catalog" className="text-muted-gray hover:text-primary transition-colors">
              Katalog Akun
            </Link>
            <Link href="/about" className="text-muted-gray hover:text-primary transition-colors">
              Tentang Kami
            </Link>
            <Link href="/#faq" className="text-muted-gray hover:text-primary transition-colors">
              Tanya Jawab (FAQ)
            </Link>
          </div>
        </div>

        {/* Game Populer */}
        <div className="flex flex-col space-y-4">
          <h3 className="font-bold text-white text-base tracking-wide uppercase border-l-2 border-primary pl-3">
            Game Terpopuler
          </h3>
          <div className="flex flex-col space-y-2.5 text-sm">
            <Link href="/catalog?game=mobile-legends" className="text-muted-gray hover:text-primary transition-colors">
              Mobile Legends
            </Link>
            <Link href="/catalog?game=free-fire" className="text-muted-gray hover:text-primary transition-colors">
              Free Fire
            </Link>
            <Link href="/catalog?game=valorant" className="text-muted-gray hover:text-primary transition-colors">
              Valorant
            </Link>
            <Link href="/catalog?game=genshin-impact" className="text-muted-gray hover:text-primary transition-colors">
              Genshin Impact
            </Link>
          </div>
        </div>

        {/* Hubungi Kami / Hubungan Kontak */}
        <div className="flex flex-col space-y-4">
          <h3 className="font-bold text-white text-base tracking-wide uppercase border-l-2 border-primary pl-3">
            Hubungi Kami
          </h3>
          <div className="flex flex-col space-y-3.5 text-sm">
            <a
              href={`https://wa.me/${settings.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 text-muted-gray hover:text-primary transition-colors"
            >
              <Phone className="h-5 w-5 text-primary shrink-0" />
              <span>+{settings.whatsapp_number}</span>
            </a>
            {settings.email_support && (
              <a
                href={`mailto:${settings.email_support}`}
                className="flex items-center space-x-3 text-muted-gray hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span className="truncate">{settings.email_support}</span>
              </a>
            )}
            <div className="flex items-start space-x-3 text-muted-gray">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span>{settings.address_info}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto border-t border-custom-border/60 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-gray gap-4">
        <span>
          © {currentYear} <span className="text-white font-semibold">{settings.site_name}</span>. Hak Cipta Dilindungi Undang-Undang.
        </span>
        <div className="flex space-x-6">
          <Link href="/terms" className="hover:text-primary transition-colors">
            Syarat & Ketentuan
          </Link>
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">
            Kebijakan Privasi
          </Link>
        </div>
      </div>
    </footer>
  );
}
