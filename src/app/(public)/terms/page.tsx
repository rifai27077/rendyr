import { FileText, CheckCircle, ShieldAlert, BadgeCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Syarat & Ketentuan - JBRENDYR.COM',
  description: 'Syarat & Ketentuan JBRENDYR.COM menjelaskan aturan penggunaan layanan transaksi jual beli akun game premium di platform kami.',
};

export default function TermsAndConditionsPage() {
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
          <span className="text-white">Syarat & Ketentuan</span>
        </div>

        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <span className="text-xs text-primary uppercase font-extrabold tracking-widest block mb-3">
            SYARAT & KETENTUAN
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            Syarat & Ketentuan Layanan
          </h1>
          <p className="text-base text-muted-gray leading-relaxed max-w-2xl">
            Harap baca syarat dan ketentuan berikut secara seksama sebelum melakukan pembelian di JBRENDYR.COM. Dengan bertransaksi, Anda setuju untuk terikat oleh aturan ini.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-10">
          {/* Section 1: Intro / General */}
          <div className="glassmorphism p-8 rounded-2xl border border-custom-border space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>1. Ketentuan Umum</span>
            </h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              JBRENDYR.COM adalah platform penyedia akun game premium (Free Fire, Mobile Legends, Valorant, dll). Platform kami melayani pengguna secara mandiri dan memproses serah terima secara aman melalui admin resmi.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-gray pl-2">
              <li>Pengguna wajib berusia minimal 17 tahun atau memiliki izin orang tua untuk bertransaksi.</li>
              <li>Seluruh transaksi diproses via obrolan WhatsApp Admin resmi demi kelancaran dan dokumentasi data.</li>
              <li>Segala bentuk transaksi di luar kontak WhatsApp resmi yang tertera di website ini bukanlah tanggung jawab JBRENDYR.COM.</li>
            </ul>
          </div>

          {/* Section 2: Account Specs & Delivery */}
          <div className="bg-secondary/40 border border-custom-border p-8 rounded-2xl space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <span>2. Kesesuaian Kredensial & Pengiriman Akun</span>
            </h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              Kami menjamin kecocokan spesifikasi akun dengan foto/deskripsi produk yang diiklankan:
            </p>
            <ul className="list-none space-y-2.5 text-sm text-muted-gray pl-2">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-white">Proses Cepat & Otomatis:</strong> Transaksi diproses dalam rentang waktu 5 hingga 15 menit setelah pembayaran Anda tervalidasi oleh sistem/admin kami.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-white">Pemeriksaan Awal:</strong> Pembeli berkewajiban memeriksa kesesuaian data akun (skin, hero, rank) secara langsung sebelum proses serah terima dinyatakan selesai sepenuhnya.</span>
              </li>
            </ul>
          </div>

          {/* Section 3: Escrow / Guarantee / Hackback */}
          <div className="glassmorphism p-8 rounded-2xl border border-custom-border space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <span>3. Sistem Garansi & Klaim Hackback</span>
            </h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              Keamanan Anda adalah prioritas kami. Kami menyediakan sistem garansi dengan ketentuan sebagai berikut:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-gray pl-2">
              <li>Setiap pembelian mendapatkan garansi anti-hackback selama 30 hari sejak tanggal transaksi, dengan syarat akun tidak dipindahtangankan ke pihak lain atau melanggar ketentuan pihak developer (game publisher).</li>
              <li>Jika terjadi penarikan kembali (hackback) oleh pemilik pertama selama masa garansi aktif, kami akan membantu proses klaim atau mencarikan akun pengganti senilai.</li>
              <li>Garansi <strong className="text-primary font-bold">BATAL/HANGUS</strong> jika pembeli dengan sengaja merusak kredensial keamanan akun, menggunakan program ilegal (cheat), atau terkena banned akibat perilaku negatif (toxic/gameplay abuse).</li>
            </ul>
          </div>

          {/* Section 4: Payments */}
          <div className="bg-secondary/40 border border-custom-border p-8 rounded-2xl space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white">4. Transaksi Pembayaran</h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              Seluruh pembayaran bersifat final dan tidak dapat dibatalkan (non-refundable) kecuali jika akun yang dipesan ternyata kosong atau tidak lagi tersedia di katalog kami. Pembeli wajib mengirimkan bukti transfer yang valid kepada admin.
            </p>
          </div>

          {/* Section 5: Updates */}
          <div className="text-xs text-muted-gray text-center pt-6">
            Syarat & Ketentuan ini diperbarui pada 23 Juni 2026. Dengan melanjutkan transaksi di JBRENDYR.COM, Anda dianggap menyetujui seluruh butir aturan di atas.
          </div>
        </div>
      </div>
    </div>
  );
}
