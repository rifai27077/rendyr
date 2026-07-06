import { ShieldCheck, Clock, Award, Zap, Users, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Tentang Kami - JBRENDYR.COM',
  description: 'JBRENDYR.COM adalah destinasi utama jual beli akun game premium terpercaya. Kami menjamin keamanan transaksi 100% menggunakan sistem Admin Escrow Resmi.',
};

export default function AboutPage() {
  return (
    <div className="flex-grow bg-dark pt-28 pb-20 px-4 sm:px-6 md:px-8">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,43,60,0.05),transparent_50%)] pointer-events-none z-0" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-muted-gray mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">Tentang Kami</span>
        </div>

        {/* Title Section */}
        <div className="mb-12 text-center md:text-left">
          <span className="text-xs text-primary uppercase font-extrabold tracking-widest block mb-3">
            TENTANG KAMI
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Destinasi Utama Jual Beli Akun Game Premium Terpercaya
          </h1>
          <p className="text-base text-muted-gray leading-relaxed max-w-2xl">
            JBRENDYR.COM hadir sebagai solusi aman dan terpercaya bagi para gamer untuk memiliki akun game impian dengan jaminan penuh dan tanpa risiko.
          </p>
        </div>

        {/* Core Content Grid */}
        <div className="space-y-12">
          {/* Main Story Container */}
          <div className="glassmorphism p-8 rounded-2xl border border-custom-border space-y-6">
            <div className="flex items-center space-x-3 text-primary mb-2">
              <Info className="h-6 w-6" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Siapa JBRENDYR.COM?</h2>
            </div>
            
            <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
              JBRENDYR.COM adalah platform marketplace terdepan di Indonesia yang berdedikasi tinggi menyediakan akun game premium siap pakai, dengan fokus utama pada <strong className="text-white">akun Free Fire Sultan</strong> serta berbagai game populer seperti Mobile Legends, Valorant, PUBG Mobile, dan Genshin Impact.
            </p>
            
            <p className="text-sm sm:text-base text-muted-gray leading-relaxed">
              Didirikan dengan visi memberikan kenyamanan penuh bagi para gamer, kami menjamin keamanan transaksi 100% menggunakan sistem <strong className="text-white">Admin Escrow / Rekber Resmi</strong>. Seluruh akun yang diiklankan telah melewati proses verifikasi data yang ketat oleh tim kami sebelum diserahterimakan ke pembeli untuk meminimalkan segala bentuk risiko sengketa atau penipuan.
            </p>
          </div>

          {/* Core Commitments Section */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center md:text-left border-l-4 border-primary pl-3">
              Layanan Terbaik untuk Anda
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Jaminan Layanan */}
              <div className="bg-secondary/40 border border-custom-border p-6 rounded-2xl flex items-start space-x-4 hover:border-primary/40 transition-colors duration-300">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">Jaminan Layanan</h3>
                  <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                    Keamanan dan kualitas layanan terjamin
                  </p>
                </div>
              </div>

              {/* Card 2: Layanan 24 Jam */}
              <div className="bg-secondary/40 border border-custom-border p-6 rounded-2xl flex items-start space-x-4 hover:border-primary/40 transition-colors duration-300">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">Layanan 24 Jam</h3>
                  <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                    Layanan non-stop, 24 jam setiap hari
                  </p>
                </div>
              </div>

              {/* Card 3: Pembayaran Aman & Terpercaya */}
              <div className="bg-secondary/40 border border-custom-border p-6 rounded-2xl flex items-start space-x-4 hover:border-primary/40 transition-colors duration-300">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">Pembayaran Aman & Terpercaya</h3>
                  <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                    Keamanan dan kualitas layanan terjamin
                  </p>
                </div>
              </div>

              {/* Card 4: Proses Cepat & Otomatis */}
              <div className="bg-secondary/40 border border-custom-border p-6 rounded-2xl flex items-start space-x-4 hover:border-primary/40 transition-colors duration-300">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">Proses Cepat & Otomatis</h3>
                  <p className="text-xs sm:text-sm text-muted-gray leading-relaxed">
                    Proses cepat, otomatis, tanpa hambatan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Escrow System Explanation */}
          <div className="bg-secondary/30 border border-custom-border p-8 rounded-2xl space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Sistem Transaksi Aman & Terverifikasi</span>
            </h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              Kami menyadari kekhawatiran terbesar pembeli akun game adalah potensi terjadinya pengambilalihan kembali akun (hackback). Oleh karena itu, di JBRENDYR.COM, setiap akun yang dibeli akan didampingi secara langsung oleh staf professional kami. Data login akan diperiksa, dibersihkan dari sesi aktif perangkat lama, dan diserahterimakan dengan aman demi ketenangan pembeli.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
