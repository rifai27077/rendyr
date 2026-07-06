import { ShieldCheck, Lock, Eye, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Kebijakan Privasi - JBRENDYR.COM',
  description: 'Kebijakan Privasi JBRENDYR.COM menjelaskan bagaimana kami mengumpulkan, menyimpan, dan melindungi informasi pribadi Anda selama menggunakan layanan kami.',
};

export default function PrivacyPolicyPage() {
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
          <span className="text-white">Kebijakan Privasi</span>
        </div>

        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <span className="text-xs text-primary uppercase font-extrabold tracking-widest block mb-3">
            KEBIJAKAN PRIVASI
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            Kebijakan Privasi Pengguna
          </h1>
          <p className="text-base text-muted-gray leading-relaxed max-w-2xl">
            Di JBRENDYR.COM, kerahasiaan dan perlindungan data pribadi Anda adalah komitmen utama kami. Kami menjamin data Anda tetap aman dan terlindungi.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-10">
          {/* Section 1: Intro */}
          <div className="glassmorphism p-8 rounded-2xl border border-custom-border space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <span>1. Pengumpulan Informasi Informasi</span>
            </h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              Kami mengumpulkan informasi pribadi minimal yang diperlukan untuk memproses pesanan dan memastikan kelancaran transaksi, meliputi:
            </p>
            <ul className="list-none space-y-2 text-sm text-muted-gray pl-2">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-white">Informasi Kontak:</strong> Nama panggilan dan nomor telepon/WhatsApp Anda untuk proses koordinasi serah terima akun.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-white">Informasi Transaksi:</strong> Data produk yang dibeli, harga, bukti pembayaran/transfer, dan rincian transaksi terkait.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-white">Informasi Teknis:</strong> Alamat IP, jenis browser, dan riwayat interaksi kunjungan di website untuk pemeliharaan keamanan server.</span>
              </li>
            </ul>
          </div>

          {/* Section 2: Use of Data */}
          <div className="bg-secondary/40 border border-custom-border p-8 rounded-2xl space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>2. Penggunaan Informasi Pribadi</span>
            </h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              Informasi yang kami kumpulkan digunakan semata-mata untuk kepentingan operasional transaksi:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-gray pl-2">
              <li>Memverifikasi dan memproses transaksi pembelian akun game Anda secara instan.</li>
              <li>Menghubungi Anda melalui WhatsApp untuk proses transfer kredensial akun secara aman.</li>
              <li>Mencegah aktivitas mencurigakan, penipuan, atau pelanggaran terhadap syarat layanan.</li>
              <li>Meningkatkan fungsionalitas, kecepatan loading, serta performa keseluruhan website kami.</li>
            </ul>
          </div>

          {/* Section 3: Data Protection */}
          <div className="glassmorphism p-8 rounded-2xl border border-custom-border space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
              <Lock className="h-5 w-5 text-primary" />
              <span>3. Keamanan Informasi Terjamin</span>
            </h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              Kami berkomitmen penuh menjaga keamanan data Anda. Dengan slogan kami <strong className="text-white">Keamanan dan kualitas layanan terjamin</strong>, kami menerapkan langkah perlindungan teknis dan organisasi yang kuat:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-gray pl-2">
              <li>Penyimpanan data sensitif di database yang terenkripsi dan terlindungi firewall ketat.</li>
              <li>Akses terbatas ke data transaksi, hanya dapat diakses oleh Admin resmi JBRENDYR.COM yang bertugas.</li>
              <li>Kami berkomitmen <strong className="text-primary font-bold">TIDAK AKAN PERNAH</strong> menjual, menyewakan, atau menyebarluaskan data pribadi Anda kepada pihak ketiga mana pun tanpa persetujuan eksplisit Anda.</li>
            </ul>
          </div>

          {/* Section 4: Cookies & Contact */}
          <div className="bg-secondary/40 border border-custom-border p-8 rounded-2xl space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white">4. Cookies & Pelacakan Web</h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              Website kami menggunakan cookies sederhana untuk mengingat sesi login admin dan mempercepat rendering halaman. Anda dapat mematikan cookies di setelan browser Anda, namun beberapa fungsi website mungkin berjalan kurang optimal.
            </p>
          </div>

          {/* Section 5: Updates */}
          <div className="text-xs text-muted-gray text-center pt-6">
            Kebijakan privasi ini terakhir diperbarui pada tanggal 23 Juni 2026. Kami menyarankan Anda memeriksa halaman ini secara berkala untuk mengetahui perubahan apa pun.
          </div>
        </div>
      </div>
    </div>
  );
}
