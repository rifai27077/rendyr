import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jbrendyr.com';

  // Define static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // Fetch categories and ready products in parallel
    const [categoriesRes, productsRes] = await Promise.all([
      supabase.from('categories').select('slug'),
      supabase.from('products').select('slug, updated_at').eq('status', 'ready'),
    ]);

    // Map dynamic category catalog pages
    const categoryPages: MetadataRoute.Sitemap = (categoriesRes.data || []).map((cat) => ({
      url: `${baseUrl}/catalog?game=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    // Map dynamic product pages
    const productPages: MetadataRoute.Sitemap = (productsRes.data || []).map((prod) => ({
      url: `${baseUrl}/product/${prod.slug}`,
      lastModified: new Date(prod.updated_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap:', error);
    return staticPages;
  }
}
