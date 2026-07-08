'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Pagination from '@/components/admin/Pagination';
import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  game_name: string;
  price: number;
  status: string;
  views: number;
  whatsapp_clicks: number;
}

export default function DashboardProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default 5 for dashboard
  const [totalCount, setTotalCount] = useState(0);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('products')
        .select('id, name, game_name, price, status, views, whatsapp_clicks', { count: 'exact' })
        .range(from, to)
        .order('views', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Failed to load dashboard products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, pageSize]);

  return (
    <div className="bg-secondary/20 border border-custom-border p-6 rounded-2xl space-y-5">
      <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide uppercase border-l-3 border-primary pl-3">
        Akun Paling Populer (Kunjungan Terbanyak)
      </h3>

      {isLoading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-muted-gray">Memuat data produk...</span>
        </div>
      ) : products.length > 0 ? (
        <div className="flex flex-col h-full min-h-[250px]">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-custom-border/60 text-muted-gray font-bold">
                  <th className="py-3 px-4">Nama Akun</th>
                  <th className="py-3 px-4">Game</th>
                  <th className="py-3 px-4">Harga</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Views</th>
                  <th className="py-3 px-4 text-center">WA Clicks</th>
                  <th className="py-3 px-4 text-center">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-border/30">
                {products.map((prod) => {
                  const views = prod.views || 0;
                  const clicks = prod.whatsapp_clicks || 0;
                  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0';

                  return (
                    <tr key={prod.id} className="hover:bg-dark/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white max-w-[220px] truncate">
                        {prod.name}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-muted-gray">{prod.game_name}</td>
                      <td className="py-3.5 px-4 font-extrabold text-primary">{formatPrice(prod.price)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded border ${
                            prod.status === 'ready'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-sold/10 text-sold border-sold/20'
                          }`}
                        >
                          {prod.status === 'ready' ? 'Tersedia' : 'Terjual'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-white">{views}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-white">{clicks}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-white">{ctr}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 border-t border-custom-border pt-4">
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20]}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-muted-gray">
          Belum ada data kunjungan produk.
        </div>
      )}
    </div>
  );
}
