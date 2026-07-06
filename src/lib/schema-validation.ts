import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z.string().min(3, 'Username / Email minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// Category Schema
export const categorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter'),
  slug: z.string().min(2, 'Slug minimal 2 karakter').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)'),
  description: z.string().optional(),
});

// Product Schema
export const productSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  game_name: z.string().min(2, 'Nama game minimal 2 karakter'),
  slug: z.string().min(2, 'Slug minimal 2 karakter').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)'),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ required_error: 'Harga wajib diisi' }).positive('Harga harus lebih besar dari 0')
  ),
  thumbnail: z.string().min(1, 'Thumbnail wajib diunggah'),
  gallery: z.array(z.string()).default([]),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
  rank: z.string().optional().default(''),
  skin: z.string().optional().default(''),
  hero: z.string().optional().default(''),
  account_info: z.string().optional().default(''),
  status: z.enum(['ready', 'sold_out']).default('ready'),
  category_id: z.string().min(1, 'Kategori wajib dipilih'),
});

// Banner Schema
export const bannerSchema = z.object({
  title: z.string().min(2, 'Judul banner minimal 2 karakter'),
  image_url: z.string().min(1, 'Gambar banner wajib diunggah'),
  link_url: z.string().optional().default(''),
  order_num: z.preprocess((val) => Number(val), z.number().default(0)),
  is_active: z.boolean().default(true),
});

// Testimonial Schema
export const testimonialSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  avatar_url: z.string().optional().default(''),
  rating: z.preprocess((val) => Number(val), z.number().min(1).max(5).default(5)),
  review: z.string().min(5, 'Review minimal 5 karakter'),
  game_name: z.string().optional().default(''),
});

// FAQ Schema
export const faqSchema = z.object({
  question: z.string().min(5, 'Pertanyaan minimal 5 karakter'),
  answer: z.string().min(5, 'Jawaban minimal 5 karakter'),
  order_num: z.preprocess((val) => Number(val), z.number().default(0)),
});

// Website Settings Schema (Object shape mapping keys in db)
export const settingsSchema = z.object({
  whatsapp_number: z.string().min(8, 'Nomor WhatsApp minimal 8 digit').regex(/^\d+$/, 'Nomor WhatsApp hanya boleh berisi angka (tanpa spasi/simbol, awali dengan kode negara, contoh: 62812345678)'),
  site_name: z.string().min(2, 'Nama website minimal 2 karakter'),
  site_title: z.string().min(3, 'Meta title minimal 3 karakter'),
  site_tagline: z.string().optional().default(''),
  site_description: z.string().optional().default(''),
  site_keywords: z.string().optional().default(''),
  instagram_url: z.string().optional().default(''),
  tiktok_url: z.string().optional().default(''),
  facebook_url: z.string().optional().default(''),
  discord_url: z.string().optional().default(''),
  email_support: z.string().email('Format email tidak valid').or(z.literal('')),
  address_info: z.string().optional().default(''),
});
