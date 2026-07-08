export interface Product {
  id: string;
  name: string;
  game_name: string;
  slug: string;
  price: number;
  thumbnail: string;
  gallery?: string[];
  description: string;
  rank?: string | null;
  skin?: string | null;
  hero?: string | null;
  status: 'ready' | 'sold_out';
  created_at: string;
  category?: {
    name: string;
    slug: string;
  } | null;
}

export const DEFAULT_CATEGORIES = [
  { id: 'cat-ff', name: 'Free Fire', slug: 'free-fire', description: 'Akun Free Fire sultan, bundle langka, dan skin senjata maksimal.' },
  { id: 'cat-ml', name: 'Mobile Legends', slug: 'mobile-legends', description: 'Koleksi akun Mobile Legends: Bang Bang premium dan aman.' },
  { id: 'cat-val', name: 'Valorant', slug: 'valorant', description: 'Akun Valorant premium, skin bundle lengkap, rank tinggi.' },
];

export const DEFAULT_PRODUCTS: Product[] = [];
