import { getSettings } from '@/lib/settings';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { cleanWhatsAppNumber } from '@/lib/utils';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const cleanPhone = cleanWhatsAppNumber(settings.whatsapp_number);
  const waMessage = encodeURIComponent(`Halo Admin ${settings.site_name}\n\nSaya ingin bertanya mengenai akun game yang diiklankan di website.`);

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar settings={settings} />
      <div className="flex-grow flex flex-col">
        {children}
      </div>
      
      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_4px_25px_rgba(37,211,102,0.45)] transition-all hover:scale-110 active:scale-95 duration-300 group cursor-pointer"
        title="Hubungi WhatsApp Admin"
      >
        <svg
          className="w-8 h-8 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.022-.08-.115-.188-.308-.285-.19-.095-1.12-.553-1.294-.615-.173-.06-.3-.09-.427.096-.127.188-.49.615-.6.733-.11.118-.22.13-.413.035-.19-.095-.8-.293-1.524-.938-.562-.5-1.01-1.116-1.12-1.306-.11-.19-.012-.294.083-.39.085-.084.19-.22.285-.33.095-.11.127-.19.19-.317.063-.127.03-.24-.015-.335-.045-.095-.427-1.026-.585-1.406-.154-.372-.325-.32-.427-.32h-.365c-.173 0-.457.065-.696.32-.24.254-1.016.992-1.016 2.42 0 1.427 1.04 2.808 1.185 3.003.146.195 2.046 3.123 4.957 4.38.694.3 1.237.478 1.662.61.697.22 1.33.19 1.83.115.556-.08 1.73-.7 1.975-1.378.24-.678.24-1.257.17-1.378zM12 21.993c-1.787 0-3.51-.48-5.025-1.39l-.36-.213-3.737.98.997-3.645-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      <Footer settings={settings} />
    </div>
  );
}
