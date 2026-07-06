'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Search, Loader2, ShoppingBag, Eye, Phone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  game_name: string;
  price: number;
  thumbnail: string;
  status: 'ready' | 'sold_out';
  rank: string | null;
  views: number;
  whatsapp_clicks: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom delete modal states
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load products list
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, game_name, price, thumbnail, status, rank, views, whatsapp_clicks')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      alert('Gagal memuat katalog produk');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Quick toggle inventory status
  const handleToggleStatus = async (id: string, currentStatus: 'ready' | 'sold_out') => {
    const nextStatus = currentStatus === 'ready' ? 'sold_out' : 'ready';
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state directly for speed
      setProducts(products.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    } catch (err: any) {
      console.error(err);
      alert('Gagal memperbarui status produk');
    }
  };

  // Open custom delete modal
  const handleDeleteClick = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  // Confirm delete handler
  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
      if (error) throw error;
      
      await loadProducts();
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal menghapus produk');
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side text filter calculations
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      q === '' ||
      p.name.toLowerCase().includes(q) ||
      p.game_name.toLowerCase().includes(q) ||
      (p.rank && p.rank.toLowerCase().includes(q)) ||
      p.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Daftar Akun Game</h1>
          <p className="text-xs sm:text-sm text-muted-gray">
            Pengelolaan seluruh produk akun game premium yang diiklankan di marketplace.
          </p>
        </div>

        <Link
          href="/admin/products/add"
          className="flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-dark font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-md shadow-primary/10 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Tambah Akun</span>
        </Link>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/10 border border-custom-border/50 p-4 rounded-2xl">
        {/* Search input */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Cari akun, nama game, rank, dll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray" />
        </div>

        <div className="text-xs text-muted-gray font-semibold shrink-0">
          Total: <span className="text-primary font-bold">{filteredProducts.length}</span> akun game
        </div>
      </div>

      {/* Products table grid */}
      <div className="bg-secondary/20 border border-custom-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-gray gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-xs">Memuat katalog akun...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-custom-border/60 text-muted-gray font-bold">
                  <th className="py-4 px-6 w-20">Foto</th>
                  <th className="py-4 px-6">Nama Akun</th>
                  <th className="py-4 px-6">Game / Rank</th>
                  <th className="py-4 px-6">Harga</th>
                  <th className="py-4 px-6 text-center">Impression</th>
                  <th className="py-4 px-6 text-center w-28">Status</th>
                  <th className="py-4 px-6 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-border/30">
                {filteredProducts.map((prod) => {
                  const isReady = prod.status === 'ready';
                  return (
                    <tr key={prod.id} className="hover:bg-dark/30 transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="relative w-12 aspect-video rounded overflow-hidden border border-custom-border bg-dark shrink-0">
                          <Image
                            src={prod.thumbnail}
                            alt={prod.name}
                            fill
                            className="object-cover"
                            sizes="60px"
                          />
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-white max-w-[200px] truncate leading-tight">
                          {prod.name}
                        </div>
                        <span className="text-[10px] text-muted-gray font-mono block mt-1">ID: {prod.id.substring(0, 8)}...</span>
                      </td>

                      {/* Game & Rank */}
                      <td className="py-4 px-6">
                        <span className="text-white font-bold block">{prod.game_name}</span>
                        <span className="text-[10px] text-primary font-semibold block mt-0.5">
                          Rank: {prod.rank || '-'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-extrabold text-primary">
                        {formatPrice(prod.price)}
                      </td>

                      {/* Views & WA Clicks */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <span className="text-[10px] text-muted-gray flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {prod.views || 0}
                          </span>
                          <span className="text-[10px] text-muted-gray flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {prod.whatsapp_clicks || 0}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle Box */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleToggleStatus(prod.id, prod.status)}
                            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md border text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all ${
                              isReady
                                ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                                : 'bg-sold/10 text-sold border-sold/20 hover:bg-sold/20'
                            }`}
                            title="Klik untuk mengubah status"
                          >
                            {isReady ? (
                              <>
                                <CheckCircle className="h-3.5 w-3.5 fill-current shrink-0" />
                                <span>Tersedia</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5 fill-current shrink-0" />
                                <span>Terjual</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/admin/products/edit?id=${prod.id}`}
                            className="p-1.5 rounded-lg bg-secondary/80 border border-custom-border hover:border-primary text-muted-gray hover:text-primary transition-all cursor-pointer"
                            title="Edit Akun"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(prod.id, prod.name)}
                            className="p-1.5 rounded-lg bg-secondary/80 border border-custom-border hover:border-sold text-muted-gray hover:text-sold transition-all cursor-pointer"
                            title="Hapus Akun"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-muted-gray border border-dashed border-custom-border rounded-2xl bg-secondary/20 flex flex-col items-center justify-center gap-3 max-w-md mx-auto my-6">
            <ShoppingBag className="h-10 w-10 text-muted-gray" />
            <span>Katalog akun game kosong.</span>
            <Link
              href="/admin/products/add"
              className="text-xs text-primary font-bold hover:underline"
            >
              Tambah produk akun pertama sekarang
            </Link>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-secondary/95 border border-custom-border rounded-2xl shadow-2xl p-6 z-10 scale-95 opacity-100 transition-all duration-300 backdrop-blur-md">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-sold/10 border border-sold/20 flex items-center justify-center text-sold animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white">Hapus Akun Game?</h3>
                <p className="text-xs text-muted-gray leading-relaxed">
                  Apakah Anda yakin ingin menghapus akun game <span className="text-white font-bold">{productToDelete.name}</span>? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3 w-full pt-4 border-t border-custom-border/40 mt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-custom-border text-white hover:bg-secondary text-xs font-bold transition-all cursor-pointer flex-1"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="px-4 py-2.5 rounded-lg bg-sold hover:bg-sold/80 text-white text-xs font-bold transition-all cursor-pointer flex-1 flex items-center justify-center space-x-1.5"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus Akun</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
