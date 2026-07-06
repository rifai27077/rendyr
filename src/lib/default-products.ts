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

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'ff-1',
    name: 'Akun FF Sultan Evo Gun Max V1',
    game_name: 'Free Fire',
    slug: 'akun-ff-sultan-evo-gun-max-v1',
    price: 1500000,
    thumbnail: '/free-fire-logo.png',
    gallery: ['/ff-ss-1.png', '/ff-ss-2.png'],
    description: 'Akun Free Fire Sultan spesifikasi dewa. Memiliki Evo Gun skin terlengkap (AK-Blue Flame Draco Max, M1014-Green Flame Draco Max, MP40-Predatory Cobra Max). Bundle langka Cobra dan bundle Old Season lengkap. Akun login FB, aman 100% no minus.',
    rank: 'Grandmaster',
    skin: 'Evo Gun Max (AK, MP40, M1014)',
    hero: 'Karakter Lengkap (Alok, Chrono max)',
    status: 'ready',
    created_at: new Date().toISOString(),
    category: { name: 'Free Fire', slug: 'free-fire' }
  }
];
