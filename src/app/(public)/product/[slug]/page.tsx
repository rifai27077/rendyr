import { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getSettings } from '@/lib/settings';
import ProductDetailClient from '@/components/public/ProductDetailClient';
import { Product } from '@/components/public/ProductCard';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { DEFAULT_PRODUCTS } from '@/lib/default-products';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fetch single product helper with error logging
async function getProductBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        game_name,
        slug,
        price,
        thumbnail,
        gallery,
        description,
        rank,
        skin,
        hero,
        status,
        views,
        whatsapp_clicks,
        category_id,
        created_at
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error in getProductBySlug:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Unexpected error in getProductBySlug:', err);
    return null;
  }
}

// Fetch related products helper
async function getRelatedProducts(categoryId: string, currentProductId: string) {
  if (!categoryId) return [];
  const { data } = await supabase
    .from('products')
    .select('id, name, game_name, slug, price, thumbnail, status, rank, skin, hero')
    .eq('category_id', categoryId)
    .eq('status', 'ready')
    .neq('id', currentProductId)
    .limit(4);

  return data || [];
}

// Dynamic SEO Metadata Generator
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let product = await getProductBySlug(slug);
  if (!product) {
    product = DEFAULT_PRODUCTS.find(p => p.slug === slug) || null;
  }
  const settings = await getSettings();

  if (!product) {
    return {
      title: 'Akun Tidak Ditemukan',
    };
  }

  // Strip simple HTML tags from description for meta description
  const cleanDescription = product.description
    .replace(/<[^>]*>/g, '')
    .substring(0, 160)
    .trim();

  return {
    title: `${product.name} - Jual Akun ${product.game_name} Murah`,
    description: cleanDescription || `Beli ${product.name} game ${product.game_name} seharga ${product.price}. Akun dijamin aman dan terpercaya hanya di ${settings.site_name}.`,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ${settings.site_name}`,
      description: cleanDescription,
      images: [product.thumbnail],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${settings.site_name}`,
      description: cleanDescription,
      images: [product.thumbnail],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let product = await getProductBySlug(slug);
  if (!product) {
    product = DEFAULT_PRODUCTS.find(p => p.slug === slug) || null;
  }
  const settings = await getSettings();

  // If product not found, render a premium 404 page
  if (!product) {
    return (
      <div className="py-20 px-4 sm:px-6 md:px-8 max-w-lg mx-auto flex-grow flex flex-col justify-center items-center text-center">
        <div className="w-16 h-16 bg-sold/10 rounded-2xl border border-sold/20 flex items-center justify-center text-sold mb-6 animate-bounce">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Akun Game Tidak Ditemukan</h2>
        <p className="text-sm text-muted-gray mb-8 leading-relaxed">
          Maaf, akun game yang Anda cari tidak tersedia, sudah terjual, atau telah dihapus oleh administrator kami.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-dark font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id);

  // SEO JSON-LD Product & Breadcrumb Schemas
  const cleanDescription = product.description.replace(/<[^>]*>/g, '').trim();
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'image': [product.thumbnail, ...(product.gallery || [])].filter(Boolean),
    'description': cleanDescription,
    'offers': {
      '@type': 'Offer',
      'url': `https://jbrendyr.com/product/${product.slug}`,
      'priceCurrency': 'IDR',
      'price': product.price,
      'availability': product.status === 'ready' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'itemCondition': 'https://schema.org/UsedCondition',
      'seller': {
        '@type': 'Organization',
        'name': settings.site_name,
      },
    },
    'category': product.game_name,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://jbrendyr.com',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Katalog',
        'item': 'https://jbrendyr.com/catalog',
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product.name,
        'item': `https://jbrendyr.com/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      {/* Schemas injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ProductDetailClient
        product={product as any}
        settings={settings}
        relatedProducts={relatedProducts as any}
      />
    </>
  );
}
