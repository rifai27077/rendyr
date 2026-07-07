import { Star, MessageSquareQuote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  avatar_url?: string | null;
  rating: number;
  review: string;
  game_name?: string | null;
}

interface TestimonialsGridProps {
  testimonials: Testimonial[];
}

export default function TestimonialsGrid({ testimonials }: TestimonialsGridProps) {
  // If there are no testimonials in the DB, show default mock reviews to keep the landing page premium
  const defaultTestimonials: Testimonial[] = [
    {
      id: 't-1',
      name: 'Rian Hidayat',
      rating: 5,
      review: 'Prosesnya luar biasa cepat! Kurang dari 10 menit akun Mobile Legends Mythical Glory sudah sukses diserahkan. Admin sangat sabar membimbing proses pemindahan datanya. Recomended banget!',
      game_name: 'Mobile Legends',
    },
    {
      id: 't-2',
      name: 'Vendy Pratama',
      rating: 5,
      review: 'Sangat puas beli akun Valorant di sini. Skin sesuai dengan deskripsi di gambar, harganya paling bersahabat dibanding toko lain, dan yang terpenting transaksi sangat aman memakai rekber JBRENDYR.',
      game_name: 'Valorant',
    },
    {
      id: 't-3',
      name: 'Siti Rahma',
      rating: 5,
      review: 'Baru pertama kali beli akun Free Fire sultan di sini langsung ketagihan. Deskripsinya lengkap dan respon admin fast respon parah. Terima kasih JBRENDYR.COM!',
      game_name: 'Free Fire',
    }
  ];

  const list = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {list.map((item) => (
        <div
          key={item.id}
          className="relative bg-secondary/50 border border-custom-border p-6 rounded-2xl flex flex-col justify-between glow-hover"
        >
          {/* Quote Icon overlay */}
          <div className="absolute right-6 top-6 text-primary/10">
            <MessageSquareQuote className="h-10 w-10" />
          </div>

          <div>
            {/* Stars rating */}
            <div className="flex items-center space-x-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < item.rating
                      ? 'text-primary fill-primary'
                      : 'text-muted-gray/30'
                  }`}
                />
              ))}
            </div>

            {/* Review text */}
            <p className="text-sm text-muted-gray italic leading-relaxed mb-6">
              "{item.review}"
            </p>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4 border-t border-custom-border/40 pt-4 mt-auto">
            {item.avatar_url ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-primary/20 shrink-0">
                <img
                  src={item.avatar_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {item.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="font-bold text-white text-sm">{item.name}</h4>
              {item.game_name && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold uppercase mt-1 inline-block">
                  {item.game_name}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
