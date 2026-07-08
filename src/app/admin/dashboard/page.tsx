import { supabase } from '@/lib/supabase';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import DashboardProductsTable from '@/components/admin/DashboardProductsTable';
import Link from 'next/link';
import { ShoppingBag, Eye, Phone, Image as ImageIcon, MessageSquare, Star, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const revalidate = 0; // Dynamic rendering, always fetch fresh stats on refresh

async function getDashboardStats() {
  try {
    // 1. Fetch counts in parallel
    const [
      productsCountRes,
      readyCountRes,
      soldCountRes,
      bannersCountRes,
      testimonialsCountRes,
      analyticsSumRes,
      analyticsDailyRes
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'ready'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'sold_out'),
      supabase.from('banners').select('*', { count: 'exact', head: true }),
      supabase.from('testimonials').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('views, whatsapp_clicks'),
      supabase.from('analytics_daily').select('*').order('date', { ascending: false }).limit(7)
    ]);

    // Calculate aggregated totals
    const totalViews = (analyticsSumRes.data || []).reduce((sum, row) => sum + (row.views || 0), 0);
    const totalClicks = (analyticsSumRes.data || []).reduce((sum, row) => sum + (row.whatsapp_clicks || 0), 0);

    return {
      totalProducts: productsCountRes.count || 0,
      readyProducts: readyCountRes.count || 0,
      soldProducts: soldCountRes.count || 0,
      totalBanners: bannersCountRes.count || 0,
      totalTestimonials: testimonialsCountRes.count || 0,
      totalViews,
      totalClicks,
      dailyAnalytics: analyticsDailyRes.data || [],
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalProducts: 0,
      readyProducts: 0,
      soldProducts: 0,
      totalBanners: 0,
      totalTestimonials: 0,
      totalViews: 0,
      totalClicks: 0,
      dailyAnalytics: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  // Calculate CTR (Click Through Rate on WA Button)
  const ctr = stats.totalViews > 0 ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Welcome Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Overview Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-gray">
            Status analitik situs, konversi WhatsApp, dan statistik katalog produk secara waktu nyata.
          </p>
        </div>
      </div>

      {/* 1. STATS GRID CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Products */}
        <div className="bg-secondary/40 border border-custom-border p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-muted-gray uppercase font-bold block mb-1">Total Produk</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-black text-white">{stats.totalProducts}</span>
              <span className="text-[10px] text-primary font-semibold">({stats.readyProducts} Ready)</span>
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-secondary/40 border border-custom-border p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl shrink-0">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-muted-gray uppercase font-bold block mb-1">Kunjungan (Views)</span>
            <span className="text-xl sm:text-2xl font-black text-white">{stats.totalViews}</span>
          </div>
        </div>

        {/* WhatsApp Click Conversions */}
        <div className="bg-secondary/40 border border-custom-border p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl shrink-0">
            <Phone className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-muted-gray uppercase font-bold block mb-1">Klik WhatsApp</span>
            <span className="text-xl sm:text-2xl font-black text-white">{stats.totalClicks}</span>
          </div>
        </div>

        {/* Conversion Rate (CTR) */}
        <div className="bg-secondary/40 border border-custom-border p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-muted-gray uppercase font-bold block mb-1">Rasio Konversi (CTR)</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-2xl font-black text-white">{ctr}%</span>
              <span className="text-[10px] text-muted-gray font-semibold">Views to WA</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. CHARTS & REVIEWS STATS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily chart (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="font-extrabold text-sm sm:text-base text-white tracking-wide uppercase border-l-3 border-primary pl-3">
            Grafik Kunjungan & Klik (7 Hari Terakhir)
          </h2>
          <AnalyticsChart data={stats.dailyAnalytics} />
        </div>

        {/* Mini stats reviews & items (4 cols) */}
        <div className="lg:col-span-4 bg-secondary/25 border border-custom-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-6 border-b border-custom-border/50 pb-3 flex items-center justify-between">
              <span>Metrik Pendukung</span>
              <Star className="h-4 w-4 text-primary fill-primary" />
            </h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-xs font-bold text-muted-gray">Banner Slider Aktif</span>
                </div>
                <span className="text-sm font-black text-white">{stats.totalBanners}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-xs font-bold text-muted-gray">Testimoni Ulasan</span>
                </div>
                <span className="text-sm font-black text-white">{stats.totalTestimonials}</span>
              </div>

              <div className="flex justify-between items-center border-t border-custom-border/40 pt-4 mt-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-muted-gray">Persentase Sold Out</span>
                </div>
                <span className="text-sm font-black text-sold">
                  {stats.totalProducts > 0 ? ((stats.soldProducts / stats.totalProducts) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-custom-border/40 text-center">
            <Link
              href="/admin/settings"
              className="text-[10px] text-primary hover:text-primary-dark font-extrabold uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer"
            >
              Ubah Pengaturan Website
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

      </div>

      {/* 3. TOP POPULAR PRODUCTS TABLE */}
      <DashboardProductsTable />
    </div>
  );
}
