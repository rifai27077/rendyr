'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsSchema } from '@/lib/schema-validation';
import { z } from 'zod';
import { Loader2, Save, Settings, Phone, Globe, Share2, Mail, ShieldAlert } from 'lucide-react';

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      whatsapp_number: '',
      site_name: 'JBRENDYR.COM',
      site_title: '',
      site_tagline: '',
      site_description: '',
      site_keywords: '',
      instagram_url: '',
      tiktok_url: '',
      facebook_url: '',
      discord_url: '',
      email_support: '',
      address_info: '',
    },
  });

  // Load settings from database
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('key, value');
      if (error) throw error;

      if (data && data.length > 0) {
        // Map list of {key, value} to form fields
        data.forEach((row) => {
          setValue(row.key as any, row.value, { shouldValidate: true });
        });
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setErrorMessage('Gagal memuat konfigurasi website dari database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const onSubmit = async (values: SettingsFormValues) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Create updates list
      const updates = Object.entries(values).map(([key, value]) => {
        return supabase
          .from('settings')
          .update({ value: String(value), updated_at: new Date().toISOString() })
          .eq('key', key);
      });

      // Execute all updates in parallel
      const results = await Promise.all(updates);
      
      // Check for errors
      const failed = results.find(res => res.error);
      if (failed) throw failed.error;

      setSuccessMessage('Pengaturan website berhasil disimpan!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Settings update error:', err);
      setErrorMessage(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Info */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Pengaturan Website</h1>
        <p className="text-xs sm:text-sm text-muted-gray">
          Ubah nama website, nomor WhatsApp admin, link media sosial, dan deskripsi SEO tanpa menyentuh kode.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-primary/10 border border-primary/20 text-primary text-xs rounded-xl p-4 font-bold">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-sold/10 border border-sold/25 text-sold text-xs rounded-xl p-4 font-bold">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-gray gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs">Memuat konfigurasi...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* SECTION 1: GENERAL & CONTACT CONFIGS */}
          <div className="bg-secondary/20 border border-custom-border rounded-2xl p-6 space-y-4">
            <h2 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2 border-b border-custom-border/50 pb-3">
              <Phone className="h-4 w-4 text-primary" />
              Kontak & General Info
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Site Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">NAMA WEBSITE</label>
                <input
                  type="text"
                  placeholder="JBRENDYR.COM"
                  {...register('site_name')}
                  className="w-full px-3 py-2 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
                {errors.site_name && (
                  <span className="text-[10px] text-sold font-bold block">{errors.site_name.message}</span>
                )}
              </div>

              {/* WA Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">NOMOR WHATSAPP (ANGKA SAJA)</label>
                <input
                  type="text"
                  placeholder="Contoh: 628123456789"
                  {...register('whatsapp_number')}
                  className="w-full px-3 py-2 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary font-mono"
                />
                <span className="text-[9px] text-muted-gray leading-none block">Gunakan kode negara di depan (62) tanpa spasi/simbol/nol.</span>
                {errors.whatsapp_number && (
                  <span className="text-[10px] text-sold font-bold block">{errors.whatsapp_number.message}</span>
                )}
              </div>

              {/* Email Support */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">EMAIL BANTUAN</label>
                <input
                  type="email"
                  placeholder="support@jbrendyr.com"
                  {...register('email_support')}
                  className="w-full px-3 py-2 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
                {errors.email_support && (
                  <span className="text-[10px] text-sold font-bold block">{errors.email_support.message}</span>
                )}
              </div>

              {/* Address Info */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">ALAMAT OPERASIONAL</label>
                <input
                  type="text"
                  placeholder="Contoh: Jakarta, Indonesia"
                  {...register('address_info')}
                  className="w-full px-3 py-2 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: SEO META TAGS */}
          <div className="bg-secondary/20 border border-custom-border rounded-2xl p-6 space-y-4">
            <h2 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2 border-b border-custom-border/50 pb-3">
              <Globe className="h-4 w-4 text-primary" />
              Meta Tags & SEO Search Engine Optimization
            </h2>
            
            <div className="space-y-4">
              {/* Site Tagline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">TAGLINE BRAND</label>
                <input
                  type="text"
                  placeholder="Marketplace Jual Beli Akun Game Terpercaya"
                  {...register('site_tagline')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* Meta Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">META TITLE (JUDUL UTAMA HOMEPAGE)</label>
                <input
                  type="text"
                  placeholder="JBRENDYR.COM | Jual Beli Akun Game Premium Terpercaya"
                  {...register('site_title')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
                {errors.site_title && (
                  <span className="text-[10px] text-sold font-bold block">{errors.site_title.message}</span>
                )}
              </div>

              {/* Meta Keywords */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">META KEYWORDS (KATA KUNCI PEMISAH KOMA)</label>
                <input
                  type="text"
                  placeholder="jual beli akun game, akun mobile legends murah, akun free fire"
                  {...register('site_keywords')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">META DESCRIPTION (DESKRIPSI PENCARIAN GOOGLE)</label>
                <textarea
                  rows={3}
                  placeholder="Tulis deskripsi lengkap mengenai website JBRENDYR.COM..."
                  {...register('site_description')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SOCIAL MEDIA LINKS */}
          <div className="bg-secondary/20 border border-custom-border rounded-2xl p-6 space-y-4">
            <h2 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2 border-b border-custom-border/50 pb-3">
              <Share2 className="h-4 w-4 text-primary" />
              Sosial Media & Saluran Komunitas
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">LINK INSTAGRAM</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/jbrendyr"
                  {...register('instagram_url')}
                  className="w-full px-3 py-2 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* TikTok */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">LINK TIKTOK</label>
                <input
                  type="text"
                  placeholder="https://tiktok.com/@jbrendyr"
                  {...register('tiktok_url')}
                  className="w-full px-3 py-2 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">LINK FACEBOOK PAGE</label>
                <input
                  type="text"
                  placeholder="https://facebook.com/jbrendyr"
                  {...register('facebook_url')}
                  className="w-full px-3 py-2 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* Discord */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray block">LINK INVITE DISCORD</label>
                <input
                  type="text"
                  placeholder="https://discord.gg/jbrendyr"
                  {...register('discord_url')}
                  className="w-full px-3 py-2 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Action Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 border-t border-custom-border/50 pt-5">
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
                  <span>SIMPAN PENGATURAN</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
