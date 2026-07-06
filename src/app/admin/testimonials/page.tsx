'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { testimonialSchema } from '@/lib/schema-validation';
import { z } from 'zod';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, Loader2, Star, MessageSquare, Link2, UploadCloud } from 'lucide-react';

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

interface Testimonial {
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
  review: string;
  game_name: string | null;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Avatar upload file states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: '',
      avatar_url: '',
      rating: 5,
      review: '',
      game_name: '',
    },
  });

  // Load testimonials
  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err: any) {
      console.error('Failed to load testimonials:', err);
      alert('Gagal memuat ulasan testimoni');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const openAddModal = () => {
    setEditingTestimonial(null);
    setUploadFile(null);
    setAvatarPreview(null);
    reset({
      name: '',
      avatar_url: '',
      rating: 5,
      review: '',
      game_name: '',
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingTestimonial(t);
    setUploadFile(null);
    setAvatarPreview(t.avatar_url);
    reset({
      name: t.name,
      avatar_url: t.avatar_url || '',
      rating: t.rating,
      review: t.review,
      game_name: t.game_name || '',
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setValue('avatar_url', 'uploading...', { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload avatar helper to Supabase Storage
  const uploadAvatarImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `testimonials/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('marketplace')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('marketplace')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (values: TestimonialFormValues) => {
    setIsSubmitting(true);
    setActionError(null);

    try {
      let finalAvatarUrl = values.avatar_url;

      if (uploadFile) {
        setUploadProgress(true);
        try {
          finalAvatarUrl = await uploadAvatarImage(uploadFile);
        } catch (uploadErr: any) {
          throw new Error('Gagal mengunggah avatar pembeli ke storage');
        } finally {
          setUploadProgress(false);
        }
      }

      if (finalAvatarUrl === 'uploading...') {
        finalAvatarUrl = ''; // fallback to blank if upload failed/unselected
      }

      if (editingTestimonial) {
        // Edit existing testimonial
        const { error } = await supabase
          .from('testimonials')
          .update({
            name: values.name,
            avatar_url: finalAvatarUrl || null,
            rating: values.rating,
            review: values.review,
            game_name: values.game_name || null,
          })
          .eq('id', editingTestimonial.id);

        if (error) throw error;
      } else {
        // Create testimonial
        const { error } = await supabase
          .from('testimonials')
          .insert([
            {
              name: values.name,
              avatar_url: finalAvatarUrl || null,
              rating: values.rating,
              review: values.review,
              game_name: values.game_name || null,
            },
          ]);

        if (error) throw error;
      }

      // Reload
      await loadTestimonials();
      setIsModalOpen(false);
      reset();
    } catch (err: any) {
      setActionError(err.message || 'Terjadi kesalahan saat menyimpan ulasan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus testimoni dari "${name}"?`)) return;

    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      
      await loadTestimonials();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal menghapus testimoni');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Ulasan Testimoni</h1>
          <p className="text-xs sm:text-sm text-muted-gray">
            Daftar ulasan dari pembeli untuk meningkatkan rasa percaya (social proof) pengunjung baru.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-dark font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-md shadow-primary/10 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Tambah Testimoni</span>
        </button>
      </div>

      {/* Grid of reviews */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-gray gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs">Memuat ulasan testimoni...</span>
        </div>
      ) : testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-secondary/40 border border-custom-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/45 transition-colors relative"
            >
              <div>
                {/* Rating stars display */}
                <div className="flex items-center space-x-0.5 mb-3.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${
                        i < t.rating ? 'text-primary fill-primary' : 'text-muted-gray/30'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-muted-gray italic leading-relaxed mb-6">
                  "{t.review}"
                </p>
              </div>

              {/* Profile card footer */}
              <div className="flex items-center justify-between border-t border-custom-border/40 pt-4 mt-auto">
                <div className="flex items-center space-x-3 min-w-0">
                  {t.avatar_url ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/20 shrink-0">
                      <Image src={t.avatar_url} alt={t.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {t.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex flex-col">
                    <h4 className="font-bold text-white text-xs truncate">{t.name}</h4>
                    {t.game_name && (
                      <span className="text-[9px] text-primary/80 font-bold truncate">
                        {t.game_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit & delete buttons */}
                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1 rounded-lg bg-secondary border border-custom-border hover:border-primary text-muted-gray hover:text-primary transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="p-1 rounded-lg bg-secondary border border-custom-border hover:border-sold text-muted-gray hover:text-sold transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-xs text-muted-gray border border-dashed border-custom-border rounded-2xl bg-secondary/20 flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
          <MessageSquare className="h-10 w-10 text-muted-gray" />
          <span>Belum ada testimoni pembeli.</span>
          <button
            onClick={openAddModal}
            className="text-xs text-primary font-bold hover:underline"
          >
            Buat testimoni pertama sekarang
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
          <div className="relative w-full max-w-md bg-secondary border border-custom-border rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto no-scrollbar backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-custom-border/50 pb-4 mb-5">
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wider">
                {editingTestimonial ? 'Ubah Testimoni' : 'Tambah Testimoni Baru'}
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
              
              {/* Buyer Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Nama Pembeli
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rian Hidayat"
                  {...register('name')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45"
                />
                {errors.name && (
                  <span className="text-[10px] text-sold font-bold block">{errors.name.message}</span>
                )}
              </div>

              {/* Game Purchased */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Nama Game yang Dibeli
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Mobile Legends"
                  {...register('game_name')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45"
                />
              </div>

              {/* Star Rating select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Rating Skor Bintang
                </label>
                <select
                  {...register('rating')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                  <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                  <option value={2}>⭐⭐ (2 Bintang)</option>
                  <option value={1}>⭐ (1 Bintang)</option>
                </select>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Isi Review / Ulasan
                </label>
                <textarea
                  rows={4}
                  placeholder="Tulis ulasan pembeli..."
                  {...register('review')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45 resize-none leading-relaxed"
                />
                {errors.review && (
                  <span className="text-[10px] text-sold font-bold block">{errors.review.message}</span>
                )}
              </div>

              {/* Avatar Selector / Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Foto Avatar Pembeli (Opsional)
                </label>
                
                <div className="border border-dashed border-custom-border hover:border-primary/50 bg-dark/40 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isSubmitting}
                  />
                  <UploadCloud className="h-6 w-6 text-primary mb-1.5" />
                  <span className="text-[10px] text-white font-bold block">Pilih Foto Profil</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-gray uppercase font-semibold">
                    <Link2 className="h-3 w-3 text-primary" />
                    <span>Atau gunakan URL Foto Langsung</span>
                  </div>
                  <input
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    {...register('avatar_url')}
                    className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45"
                  />
                </div>

                {avatarPreview && (
                  <div className="flex items-center justify-center pt-2">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-primary/20">
                      <Image
                        src={avatarPreview}
                        alt="Pratinjau Avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
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
                    <span>Simpan Testimoni</span>
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
