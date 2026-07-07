import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';


const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Rendy R JB',
    default: 'Rendy R JB | Jual Beli Akun Game Premium & Terpercaya',
  },
  description: 'Marketplace jual beli akun game premium (Mobile Legends, Free Fire, Valorant, dll.) aman, terpercaya, murah, dan bergaransi di Rendy R JB. Transaksi kilat dan jaminan 100% aman.',
  keywords: [
    'jual beli akun game',
    'jual akun game murah',
    'toko akun game terpercaya',
    'jual akun ML sultan',
    'jual akun FF murah',
    'jual akun Valorant premium',
    'rekening bersama game',
    'Rendy R JB',
    'RendyR',
    'RendyR JB',
    'rendyr.com'
  ],
  authors: [{ name: 'Rendy R JB' }],
  creator: 'Rendy R JB',
  publisher: 'Rendy R JB',
  metadataBase: new URL('https://rendyr.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Rendy R JB | Jual Beli Akun Game Premium & Terpercaya',
    description: 'Marketplace jual beli akun game premium (Mobile Legends, Free Fire, Valorant, dll.) aman, terpercaya, murah, dan bergaransi di Rendy R JB.',
    url: 'https://rendyr.com',
    siteName: 'Rendy R JB',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rendy R JB | Jual Beli Akun Game Premium & Terpercaya',
    description: 'Marketplace jual beli akun game premium (Mobile Legends, Free Fire, Valorant, dll.) aman, terpercaya, murah, dan bergaransi di Rendy R JB.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${plusJakartaSans.variable} antialiased min-h-screen bg-dark text-white`}>
        {children}
      </body>
    </html>
  );
}
