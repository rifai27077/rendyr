'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema } from '@/lib/schema-validation';
import { z } from 'zod';
import { Plus, Edit2, Trash2, X, Loader2, RefreshCw, Grid, Search } from 'lucide-react';
import { generateSlug } from '@/lib/utils';
import Pagination from '@/components/admin/Pagination';

type CategoryFormValues = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  // Watch the name field to automatically generate the slug in real-time
  const watchedName = watch('name');
  useEffect(() => {
    if (watchedName && !editingCategory) {
      setValue('slug', generateSlug(watchedName), { shouldValidate: true });
    }
  }, [watchedName, editingCategory, setValue]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load categories on load
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let res;
      if (debouncedSearchQuery) {
        res = await supabase
          .from('categories')
          .select('*', { count: 'exact' })
          .ilike('name', `%${debouncedSearchQuery}%`)
          .range(from, to)
          .order('name', { ascending: true });
      } else {
        res = await supabase
          .from('categories')
          .select('*', { count: 'exact' })
          .range(from, to)
          .order('name', { ascending: true });
      }
      const { data, error, count } = res;

      if (error) throw error;
      setCategories(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      alert('Gagal memuat kategori game');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [page, pageSize, debouncedSearchQuery]);

  const openAddModal = () => {
    setEditingCategory(null);
    reset({
      name: '',
      slug: '',
      description: '',
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    setActionError(null);

    try {
      if (editingCategory) {
        // Edit existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: values.name,
            slug: values.slug,
            description: values.description,
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([
            {
              name: values.name,
              slug: values.slug,
              description: values.description,
            },
          ]);

        if (error) throw error;
      }

      // Reload data, close modal, and reset form
      await loadCategories();
      setIsModalOpen(false);
      reset();
    } catch (err: any) {
      setActionError(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"? Menghapus kategori dapat mengubah asosiasi produk.`)) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      
      // Reload
      await loadCategories();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal menghapus kategori');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Kategori Game</h1>
          <p className="text-xs sm:text-sm text-muted-gray">
            Daftar game yang dijual di marketplace. Menghubungkan produk ke menu navigasi catalog.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-dark font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-md shadow-primary/10 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/10 border border-custom-border/50 p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Cari nama kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray" />
        </div>

        <div className="text-xs text-muted-gray font-semibold shrink-0">
          Total: <span className="text-primary font-bold">{totalCount}</span> kategori
        </div>
      </div>

      {/* Categories table */}
      <div className="bg-secondary/20 border border-custom-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-gray gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-xs">Memuat kategori...</span>
          </div>
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-custom-border/60 text-muted-gray font-bold">
                  <th className="py-4 px-6">Nama Kategori</th>
                  <th className="py-4 px-6">Slug URL</th>
                  <th className="py-4 px-6">Deskripsi</th>
                  <th className="py-4 px-6 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-border/30">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-dark/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                      <Grid className="h-4 w-4 text-primary shrink-0" />
                      {cat.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-primary/80">/catalog?game={cat.slug}</td>
                    <td className="py-4 px-6 text-muted-gray max-w-xs truncate">{cat.description || '-'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg bg-secondary/80 border border-custom-border hover:border-primary text-muted-gray hover:text-primary transition-all cursor-pointer"
                          title="Ubah Kategori"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 rounded-lg bg-secondary/80 border border-custom-border hover:border-sold text-muted-gray hover:text-sold transition-all cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-muted-gray flex flex-col items-center justify-center gap-3">
            <span>Belum ada kategori game yang terdaftar.</span>
            <button
              onClick={openAddModal}
              className="text-xs text-primary font-bold hover:underline"
            >
              Buat kategori pertama sekarang
            </button>
          </div>
        )}

        {totalCount > 0 && !isLoading && (
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* POPUP MODAL (Add / Edit Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          {/* Modal Sheet */}
          <div className="relative w-full max-w-md bg-secondary border border-custom-border rounded-2xl shadow-2xl p-6 z-10 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-custom-border/50 pb-4 mb-5">
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wider">
                {editingCategory ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-muted-gray hover:text-white hover:bg-dark/45 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionError && (
              <div className="bg-sold/10 border border-sold/25 text-sold text-xs rounded-xl p-3 mb-5 font-bold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Mobile Legends"
                  {...register('name')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45"
                />
                {errors.name && (
                  <span className="text-[10px] text-sold font-bold block">{errors.name.message}</span>
                )}
              </div>

              {/* Slug URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Slug URL Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: mobile-legends"
                  {...register('slug')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45 font-mono"
                />
                {errors.slug && (
                  <span className="text-[10px] text-sold font-bold block">{errors.slug.message}</span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  placeholder="Tulis penjelasan singkat mengenai kategori game ini..."
                  {...register('description')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45 resize-none leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-custom-border/50">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-custom-border text-white hover:bg-secondary text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-dark text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-dark" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Kategori</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
