import { supabase } from '@/lib/supabase';
import { getSettings } from '@/lib/settings';
import CatalogClient from '@/components/public/CatalogClient';
import { Product } from '@/components/public/ProductCard';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const revalidate = 60; // ISR cache every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Katalog Akun Game Murah & Sultan | ${settings.site_name}`,
    description: `Temukan daftar akun game Mobile Legends, Valorant, Free Fire sultan lengkap seharga termurah. Pilih game kesukaanmu, filter spesifikasinya, dan order langsung via WhatsApp.`,
    alternates: {
      canonical: '/catalog',
    },
  };
}

import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '@/lib/default-products';

async function getCatalogData() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('products')
        .select(`
          id, 
          name, 
          game_name, 
          slug, 
          price, 
          thumbnail, 
          status, 
          rank, 
          skin, 
          hero, 
          description,
          created_at,
          category:categories(name, slug)
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('id, name, slug')
        .order('name', { ascending: true })
    ]);

    const products = productsRes.data !== null 
      ? productsRes.data 
      : DEFAULT_PRODUCTS;
      
    const categories = categoriesRes.data !== null 
      ? categoriesRes.data 
      : DEFAULT_CATEGORIES;

    return {
      products: products as unknown as Product[],
      categories: categories,
    };
  } catch (error) {
    console.error('Error fetching catalog data:', error);
    return { products: DEFAULT_PRODUCTS as unknown as Product[], categories: DEFAULT_CATEGORIES };
  }
}

export default async function CatalogPage() {
  const { products, categories } = await getCatalogData();

  return (
    <Suspense fallback={
      <div className="py-32 flex flex-col items-center justify-center text-muted-gray gap-2 max-w-7xl mx-auto flex-grow min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span>Memuat katalog akun...</span>
      </div>
    }>
      <CatalogClient initialProducts={products} categories={categories} />
    </Suspense>
  );
}
