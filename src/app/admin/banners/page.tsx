'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bannerSchema } from '@/lib/schema-validation';
import { z } from 'zod';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, Loader2, Image as ImageIcon, ExternalLink, Link2, UploadCloud } from 'lucide-react';

type BannerFormValues = z.infer<typeof bannerSchema>;

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  order_num: number;
  is_active: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom file upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      image_url: '',
      link_url: '',
      order_num: 0,
      is_active: true,
    },
  });

  // Load banners on load
  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (err: any) {
      console.error('Failed to load banners:', err);
      alert('Gagal memuat banner slider');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setUploadFile(null);
    setImagePreview(null);
    reset({
      title: '',
      image_url: '',
      link_url: '',
      order_num: banners.length, // default next order
      is_active: true,
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setUploadFile(null);
    setImagePreview(banner.image_url);
    reset({
      title: banner.title,
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      order_num: banner.order_num,
      is_active: banner.is_active,
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue('image_url', 'uploading...', { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload file helper to Supabase Storage
  const uploadBannerImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    // Upload to bucket 'marketplace' (make sure it exists or handles exception)
    const { error: uploadError } = await supabase.storage
      .from('marketplace')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      // If bucket does not exist, throw explanatory error
      if (uploadError.message.includes('bucket')) {
        throw new Error('Storage bucket "marketplace" tidak ditemukan. Buat bucket bernama "marketplace" dengan akses publik di dashboard Supabase Anda terlebih dahulu.');
      }
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('marketplace')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (values: BannerFormValues) => {
    setIsSubmitting(true);
    setActionError(null);

    try {
      let finalImageUrl = values.image_url;

      // 1. Upload file if selected
      if (uploadFile) {
        setUploadProgress(true);
        try {
          finalImageUrl = await uploadBannerImage(uploadFile);
        } catch (uploadErr: any) {
          throw new Error(uploadErr.message || 'Gagal mengunggah file gambar ke storage');
        } finally {
          setUploadProgress(false);
        }
      }

      if (finalImageUrl === 'uploading...') {
        throw new Error('Gagal mendeteksi gambar, unggah file kembali atau isi URL gambar.');
      }

      // 2. Save database record
      if (editingBanner) {
        // Edit banner
        const { error } = await supabase
          .from('banners')
          .update({
            title: values.title,
            image_url: finalImageUrl,
            link_url: values.link_url || null,
            order_num: values.order_num,
            is_active: values.is_active,
          })
          .eq('id', editingBanner.id);

        if (error) throw error;
      } else {
        // Create banner
        const { error } = await supabase
          .from('banners')
          .insert([
            {
              title: values.title,
              image_url: finalImageUrl,
              link_url: values.link_url || null,
              order_num: values.order_num,
              is_active: values.is_active,
            },
          ]);

        if (error) throw error;
      }

      // Reload
      await loadBanners();
      setIsModalOpen(false);
      reset();
    } catch (err: any) {
      setActionError(err.message || 'Gagal menyimpan banner slider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus banner "${title}"?`)) return;

    try {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
      
      await loadBanners();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal menghapus banner');
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;
      
      // Update local state directly for speedy feedback
      setBanners(banners.map(b => b.id === banner.id ? { ...b, is_active: !b.is_active } : b));
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengubah status banner');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Banner Slider</h1>
          <p className="text-xs sm:text-sm text-muted-gray">
            Pengelolaan spanduk / slide banner promosi yang dipajang di halaman depan (hero slider).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-dark font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-md shadow-primary/10 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Tambah Banner</span>
        </button>
      </div>

      {/* Grid of Banners */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-gray gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs">Memuat daftar banner...</span>
        </div>
      ) : banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-secondary/40 border border-custom-border rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              {/* Image box */}
              <div className="relative aspect-video w-full bg-dark">
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                
                {/* Active check indicator */}
                <div className="absolute top-4 left-4 z-10">
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md border backdrop-blur-sm cursor-pointer ${
                      banner.is_active
                        ? 'bg-primary/20 text-primary border-primary/30'
                        : 'bg-dark/80 text-muted-gray border-custom-border/50'
                    }`}
                  >
                    {banner.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
              </div>

              {/* Banner Metadata & controls */}
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-white line-clamp-1 leading-snug">{banner.title}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-muted-gray">
                    <span>Urutan: <span className="text-white font-bold">{banner.order_num}</span></span>
                    {banner.link_url && (
                      <>
                        <span>•</span>
                        <a
                          href={banner.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 font-semibold"
                        >
                          Tautan Link
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 border-t border-custom-border/40 pt-4">
                  <button
                    onClick={() => openEditModal(banner)}
                    className="flex items-center space-x-1 px-3.5 py-2 rounded-lg bg-secondary/80 border border-custom-border hover:border-primary text-muted-gray hover:text-primary transition-all text-xs font-bold cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Ubah</span>
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id, banner.title)}
                    className="flex items-center space-x-1 px-3.5 py-2 rounded-lg bg-secondary/80 border border-custom-border hover:border-sold text-muted-gray hover:text-sold transition-all text-xs font-bold cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-xs text-muted-gray border border-dashed border-custom-border rounded-2xl bg-secondary/20 flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
          <ImageIcon className="h-10 w-10 text-muted-gray" />
          <span>Belum ada slide banner yang terpasang.</span>
          <button
            onClick={openAddModal}
            className="text-xs text-primary font-bold hover:underline"
          >
            Buat banner pertama sekarang
          </button>
        </div>
      )}

      {/* POPUP MODAL (Add / Edit Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          {/* Modal Sheet */}
          <div className="relative w-full max-w-lg bg-secondary border border-custom-border rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto no-scrollbar backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-custom-border/50 pb-4 mb-5">
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wider">
                {editingBanner ? 'Ubah Banner' : 'Tambah Banner Baru'}
              </h3>
              <button
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-muted-gray hover:text-white hover:bg-dark/45"
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
              
              {/* Banner Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Judul Banner
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Diskon Akun MLBB up to 20%"
                  {...register('title')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45"
                />
                {errors.title && (
                  <span className="text-[10px] text-sold font-bold block">{errors.title.message}</span>
                )}
              </div>

              {/* Banner Image selector / Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Gambar Banner
                </label>
                
                {/* Upload drag area */}
                <div className="border-2 border-dashed border-custom-border hover:border-primary/50 bg-dark/40 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isSubmitting}
                  />
                  <UploadCloud className="h-8 w-8 text-primary mb-2" />
                  <span className="text-xs text-white font-bold block">Pilih File Foto</span>
                  <span className="text-[10px] text-muted-gray mt-1 block">Rekomendasi rasio 16:9 (e.g. 1920x1080)</span>
                </div>

                {errors.image_url && (
                  <span className="text-[10px] text-sold font-bold block mt-1">{errors.image_url.message}</span>
                )}

                {/* Local preview window */}
                {imagePreview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-custom-border bg-dark mt-2">
                    <Image
                      src={imagePreview}
                      alt="Pratinjau Banner"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                )}
              </div>

              {/* Redirect Action Link URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Tautan Klik Link URL (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: /catalog?game=mobile-legends"
                  {...register('link_url')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45"
                />
              </div>

              {/* Ordering and status row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Order Index */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    {...register('order_num')}
                    className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45"
                  />
                </div>

                {/* Toggle status checkbox */}
                <div className="flex items-center space-x-2.5 h-full pt-6">
                  <input
                    id="is_active"
                    type="checkbox"
                    {...register('is_active')}
                    className="w-4 h-4 rounded border-custom-border text-primary bg-dark/60 focus:ring-primary focus:ring-opacity-25"
                  />
                  <label htmlFor="is_active" className="text-xs font-bold text-white uppercase tracking-wider cursor-pointer select-none">
                    Aktifkan Slide
                  </label>
                </div>
              </div>

              {/* Submit Action buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-custom-border/50 mt-5">
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
                  disabled={isSubmitting || uploadProgress}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-dark text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-dark" />
                      <span>
                        {uploadProgress ? 'Mengunggah Foto...' : 'Menyimpan...'}
                      </span>
                    </>
                  ) : (
                    <span>Simpan Banner</span>
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
