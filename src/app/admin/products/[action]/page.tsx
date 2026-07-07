'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@/lib/schema-validation';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { generateSlug, addWatermarkToImage } from '@/lib/utils';
import {
  ArrowLeft,
  Loader2,
  Save,
  UploadCloud,
  X,
  Plus,
  Eye,
  EyeOff,
  Sparkles,
  Sword,
  Award,
  Link2,
} from 'lucide-react';

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const action = params.action as string; // 'add' or 'edit'
  const productId = searchParams.get('id');

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Custom file upload states
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]); // To track already uploaded gallery images when editing
  const [showAccountInfo, setShowAccountInfo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      game_name: '',
      slug: '',
      price: 0,
      thumbnail: '',
      gallery: [],
      description: '',
      rank: '',
      skin: '',
      hero: '',
      account_info: '',
      status: 'ready',
      category_id: '',
    },
  });

  // Watch product name to automatically generate SEO-friendly slug
  const watchedName = watch('name');
  useEffect(() => {
    if (watchedName && action === 'add') {
      setValue('slug', generateSlug(watchedName), { shouldValidate: true });
    }
  }, [watchedName, action, setValue]);

  // Watch category select to set the game_name automatically
  const watchedCategoryId = watch('category_id');
  useEffect(() => {
    if (watchedCategoryId && categories.length > 0) {
      const selectedCat = categories.find((c) => c.id === watchedCategoryId);
      if (selectedCat) {
        setValue('game_name', selectedCat.name, { shouldValidate: true });
      }
    }
  }, [watchedCategoryId, categories, setValue]);

  // Load initial form data
  useEffect(() => {
    const loadFormData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name', { ascending: true });

        if (catError) throw catError;
        setCategories(catData || []);

        // 2. Fetch product details if action is 'edit'
        if (action === 'edit' && productId) {
          const { data: prodData, error: prodError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .maybeSingle();

          if (prodError) throw prodError;
          if (!prodData) {
            alert('Produk tidak ditemukan');
            router.push('/admin/products');
            return;
          }

          // Populate form fields
          reset({
            name: prodData.name,
            game_name: prodData.game_name,
            slug: prodData.slug,
            price: Number(prodData.price),
            thumbnail: prodData.thumbnail,
            gallery: prodData.gallery || [],
            description: prodData.description,
            rank: prodData.rank || '',
            skin: prodData.skin || '',
            hero: prodData.hero || '',
            account_info: prodData.account_info || '',
            status: prodData.status,
            category_id: prodData.category_id || '',
          });

          setThumbnailPreview(prodData.thumbnail);
          setExistingGallery(prodData.gallery || []);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || 'Gagal memuat data formulir.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [action, productId, reset, router]);

  // Handle single thumbnail selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
        setValue('thumbnail', 'uploading...', { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple gallery selections
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      
      // Load previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove selected local gallery file before saving
  const handleRemoveLocalGallery = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing gallery file already uploaded to database
  const handleRemoveExistingGallery = (url: string) => {
    setExistingGallery((prev) => prev.filter((item) => item !== url));
  };

  // Upload file helper to Supabase Storage
  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('marketplace')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('marketplace')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Upload Thumbnail file if set
      let finalThumbnailUrl = values.thumbnail;
      if (thumbnailFile) {
        const watermarkedFile = await addWatermarkToImage(thumbnailFile, 'JBRENDYR.COM');
        finalThumbnailUrl = await uploadImage(watermarkedFile, 'products');
      }

      if (!finalThumbnailUrl || finalThumbnailUrl === 'uploading...') {
        throw new Error('Thumbnail gambar produk wajib diunggah.');
      }

      // 2. Upload multiple screenshot Gallery files if set
      const newGalleryUrls: string[] = [];
      if (galleryFiles.length > 0) {
        for (const file of galleryFiles) {
          const watermarkedFile = await addWatermarkToImage(file, 'JBRENDYR.COM');
          const url = await uploadImage(watermarkedFile, 'products');
          newGalleryUrls.push(url);
        }
      }

      // Combine existing database images with newly uploaded images
      const finalGallery = [...existingGallery, ...newGalleryUrls];

      const payload = {
        name: values.name,
        game_name: values.game_name,
        slug: values.slug,
        price: values.price,
        thumbnail: finalThumbnailUrl,
        gallery: finalGallery,
        description: values.description,
        rank: values.rank || null,
        skin: values.skin || null,
        hero: values.hero || null,
        account_info: values.account_info || null,
        status: values.status,
        category_id: values.category_id || null,
        updated_at: new Date().toISOString(),
      };

      if (action === 'edit' && productId) {
        // Update database row
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', productId);

        if (error) throw error;
      } else {
        // Insert database row
        const { error } = await supabase
          .from('products')
          .insert([payload]);

        if (error) throw error;
      }

      // Success
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan produk akun game.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Back button */}
      <div className="flex items-center space-x-3">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg bg-secondary border border-custom-border hover:border-primary text-muted-gray hover:text-primary transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {action === 'edit' ? 'Ubah Akun Game' : 'Tambah Akun Game'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-gray">
            {action === 'edit' ? 'Modifikasi detail spesifikasi akun game Anda.' : 'Tambahkan listing akun game baru ke dalam katalog.'}
          </p>
        </div>
      </div>

      {/* Errors Banner */}
      {errorMessage && (
        <div className="bg-sold/10 border border-sold/25 text-sold text-xs rounded-xl p-4 font-bold">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-gray gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs">Memuat formulir produk...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-12">
          
          {/* SECTION 1: MAIN INFO */}
          <div className="bg-secondary/20 border border-custom-border p-6 rounded-2xl space-y-4">
            <h2 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2 border-b border-custom-border/50 pb-3">
              Informasi Utama Produk
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Title */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-muted-gray block">NAMA LISTING PRODUK</label>
                <input
                  type="text"
                  placeholder="Contoh: Akun MLBB Sultan 500 Skin - Skin Legend Gusion"
                  {...register('name')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
                {errors.name && (
                  <span className="text-[10px] text-sold font-bold block">{errors.name.message}</span>
                )}
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">KATEGORI GAME</label>
                <select
                  {...register('category_id')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                >
                  <option value="">Pilih Game...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <span className="text-[10px] text-sold font-bold block">{errors.category_id.message}</span>
                )}
              </div>

              {/* Product Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">HARGA JUAL (IDR)</label>
                <input
                  type="number"
                  placeholder="1500000"
                  {...register('price')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary font-mono"
                />
                {errors.price && (
                  <span className="text-[10px] text-sold font-bold block">{errors.price.message}</span>
                )}
              </div>

              {/* Slug URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">SLUG SEO URL (HURUF KECIL & STRIP)</label>
                <input
                  type="text"
                  placeholder="akun-mlbb-sultan-500-skin"
                  {...register('slug')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary font-mono"
                />
                {errors.slug && (
                  <span className="text-[10px] text-sold font-bold block">{errors.slug.message}</span>
                )}
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">STATUS KETERSEDIAAN</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                >
                  <option value="ready">Tersedia (Ready)</option>
                  <option value="sold_out">Terjual (Sold Out)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: IMAGES UPLOADS */}
          <div className="bg-secondary/20 border border-custom-border p-6 rounded-2xl space-y-5">
            <h2 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2 border-b border-custom-border/50 pb-3">
              Foto Thumbnail & Galeri Screenshot
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Thumbnail upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-gray block">FOTO THUMBNAIL (SAMPUL UTAMA)</label>
                
                <div className="border-2 border-dashed border-custom-border hover:border-primary/50 bg-dark/40 rounded-xl p-4 flex flex-col items-center justify-center text-center relative transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <UploadCloud className="h-8 w-8 text-primary mb-1.5" />
                  <span className="text-xs text-white font-bold block">Pilih File Sampul</span>
                  <span className="text-[9px] text-muted-gray mt-0.5">Rasio landscape 16:9 ideal</span>
                </div>

                {errors.thumbnail && (
                  <span className="text-[10px] text-sold font-bold block mt-1">{errors.thumbnail.message}</span>
                )}

                {thumbnailPreview && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-custom-border bg-dark mt-2">
                    {/* Use regular img instead of Image component */}
                    <img src={thumbnailPreview} alt="Pratinjau Sampul" className="w-full h-full object-contain p-1" />
                  </div>
                )}
              </div>

              {/* Product Gallery upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-gray block">GALERI FOTO DETAIL (MULTIPLE)</label>
                
                <div className="border-2 border-dashed border-custom-border hover:border-primary/50 bg-dark/40 rounded-xl p-4 flex flex-col items-center justify-center text-center relative transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <UploadCloud className="h-8 w-8 text-primary mb-1.5" />
                  <span className="text-xs text-white font-bold block">Unggah Gambar Galeri</span>
                  <span className="text-[9px] text-muted-gray mt-0.5">Bisa memilih lebih dari satu file</span>
                </div>

                {/* Previews grid */}
                {(existingGallery.length > 0 || galleryPreviews.length > 0) && (
                  <div className="space-y-3 mt-4">
                    <span className="text-[10px] text-muted-gray font-bold uppercase tracking-wider block">Daftar Galeri Aktif:</span>
                    <div className="grid grid-cols-4 gap-2">
                      
                      {/* Already uploaded existing gallery items */}
                      {existingGallery.map((url, index) => (
                        <div key={`exist-${index}`} className="relative aspect-video rounded border border-custom-border overflow-hidden bg-dark group">
                          {/* Use regular img instead of Image component */}
                          <img src={url} alt="Galeri" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingGallery(url)}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-sold text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {/* Selected local files gallery items */}
                      {galleryPreviews.map((preview, index) => (
                        <div key={`local-${index}`} className="relative aspect-video rounded border border-primary/40 overflow-hidden bg-dark group">
                          {/* Use regular img instead of Image component */}
                          <img src={preview} alt="Galeri" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveLocalGallery(index)}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-sold text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: SPECIFICATIONS GRID */}
          <div className="bg-secondary/20 border border-custom-border p-6 rounded-2xl space-y-4">
            <h2 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2 border-b border-custom-border/50 pb-3">
              Spesifikasi Akun Game (Pajangan Utama Card)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Rank */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary shrink-0" />
                  RANK AKUN
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Mythical Glory"
                  {...register('rank')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* Skin Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  TOTAL SKIN
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 154 Skins"
                  {...register('skin')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* Hero Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block flex items-center gap-1.5">
                  <Sword className="h-4 w-4 text-primary shrink-0" />
                  TOTAL HERO
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 89 Heroes"
                  {...register('hero')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: DETAILED DESCRIPTION */}
          <div className="bg-secondary/20 border border-custom-border p-6 rounded-2xl space-y-4">
            <h2 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2 border-b border-custom-border/50 pb-3">
              Deskripsi Lengkap Detail Akun
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-gray block">DESKRIPSI (DUKUNG LINE BREAKS & TULIS SPESIFIKASI SKU)</label>
              <textarea
                rows={8}
                placeholder="Tulis deskripsi detail mengenai item, detail emblem, koleksi skin langka (Legend/Collector), akun bind link, dsb..."
                {...register('description')}
                className="w-full px-3 py-3 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary resize-none leading-relaxed font-sans"
              />
              {errors.description && (
                <span className="text-[10px] text-sold font-bold block">{errors.description.message}</span>
              )}
            </div>
          </div>

          {/* SECTION 5: ACCOUNT DETAILS (SENSITIVE CREDENTIALS) */}
          <div className="bg-secondary/20 border border-custom-border p-6 rounded-2xl space-y-4">
            <h2 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2 border-b border-custom-border/50 pb-3">
              Informasi Akun (Hanya Terlihat Oleh Admin)
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-gray block flex items-center gap-1.5">
                DETAIL KREDENSIAL LOGIN & KONTAK PENJUAL
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  type={showAccountInfo ? 'text' : 'password'} // mask text
                  placeholder="Tulis email login, kata sandi, tipe akun (Moonton/Google Play), nomor kontak pemilik asli, dsb..."
                  {...register('account_info')}
                  className="w-full px-3 py-3 pr-12 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45 resize-none leading-relaxed font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowAccountInfo(!showAccountInfo)}
                  className="absolute right-3.5 top-3.5 text-muted-gray hover:text-white"
                  title={showAccountInfo ? 'Sembunyikan data' : 'Tampilkan data'}
                >
                  {showAccountInfo ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <span className="text-[10px] text-primary/80 font-bold block leading-relaxed">
                ⚠️ PERINGATAN KEAMANAN: Informasi kredensial di atas sepenuhnya dirahasiakan dan dienkripsi di sisi server. Pembeli umum/pengunjung tidak akan pernah melihat detail ini di halaman publik.
              </span>
            </div>
          </div>

          {/* Submit Action buttons */}
          <div className="flex items-center justify-end space-x-4 border-t border-custom-border/50 pt-6 mt-8">
            <Link
              href="/admin/products"
              className="px-5 py-3 rounded-lg border border-custom-border text-white hover:bg-secondary text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </Link>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-dark font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-dark" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>SIMPAN AKUN GAME</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
