'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { faqSchema } from '@/lib/schema-validation';
import { z } from 'zod';
import { Plus, Edit2, Trash2, X, Loader2, HelpCircle, ArrowUpDown } from 'lucide-react';

type FAQFormValues = z.infer<typeof faqSchema>;

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_num: number;
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FAQFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      order_num: 0,
    },
  });

  // Load FAQs
  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (err: any) {
      console.error('Failed to load FAQs:', err);
      alert('Gagal memuat daftar tanya jawab FAQ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const openAddModal = () => {
    setEditingFaq(null);
    reset({
      question: '',
      answer: '',
      order_num: faqs.length + 1, // default next order
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    reset({
      question: faq.question,
      answer: faq.answer,
      order_num: faq.order_num,
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const onSubmit = async (values: FAQFormValues) => {
    setIsSubmitting(true);
    setActionError(null);

    try {
      if (editingFaq) {
        // Edit Faq
        const { error } = await supabase
          .from('faqs')
          .update({
            question: values.question,
            answer: values.answer,
            order_num: values.order_num,
          })
          .eq('id', editingFaq.id);

        if (error) throw error;
      } else {
        // Create Faq
        const { error } = await supabase
          .from('faqs')
          .insert([
            {
              question: values.question,
              answer: values.answer,
              order_num: values.order_num,
            },
          ]);

        if (error) throw error;
      }

      await loadFaqs();
      setIsModalOpen(false);
      reset();
    } catch (err: any) {
      setActionError(err.message || 'Gagal menyimpan tanya jawab FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus FAQ "${question.substring(0, 40)}..."?`)) return;

    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
      
      await loadFaqs();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal menghapus FAQ');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Kelola Tanya Jawab (FAQ)</h1>
          <p className="text-xs sm:text-sm text-muted-gray">
            Pengelolaan menu tanya jawab yang dipajang di website untuk membimbing pembeli.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-dark font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-md shadow-primary/10 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Tambah FAQ</span>
        </button>
      </div>

      {/* Table grid */}
      <div className="bg-secondary/20 border border-custom-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-gray gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-xs">Memuat daftar FAQ...</span>
          </div>
        ) : faqs.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-custom-border/60 text-muted-gray font-bold">
                  <th className="py-4 px-6 w-20 text-center">Order</th>
                  <th className="py-4 px-6">Pertanyaan</th>
                  <th className="py-4 px-6">Jawaban</th>
                  <th className="py-4 px-6 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom-border/30">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-dark/30 transition-colors">
                    <td className="py-4 px-6 text-center font-mono text-primary font-bold">
                      #{faq.order_num}
                    </td>
                    <td className="py-4 px-6 font-bold text-white max-w-xs sm:max-w-md truncate">
                      {faq.question}
                    </td>
                    <td
                      className="py-4 px-6 text-muted-gray max-w-sm truncate"
                      dangerouslySetInnerHTML={{ __html: faq.answer.replace(/<[^>]*>/g, '') }} // plain text preview
                    />
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-1.5 rounded-lg bg-secondary/80 border border-custom-border hover:border-primary text-muted-gray hover:text-primary transition-all cursor-pointer"
                          title="Ubah FAQ"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id, faq.question)}
                          className="p-1.5 rounded-lg bg-secondary/80 border border-custom-border hover:border-sold text-muted-gray hover:text-sold transition-all cursor-pointer"
                          title="Hapus FAQ"
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
            <HelpCircle className="h-10 w-10 text-muted-gray" />
            <span>Belum ada FAQ yang terdaftar.</span>
            <button
              onClick={openAddModal}
              className="text-xs text-primary font-bold hover:underline"
            >
              Buat pertanyaan pertama sekarang
            </button>
          </div>
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
          <div className="relative w-full max-w-lg bg-secondary border border-custom-border rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto no-scrollbar backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-custom-border/50 pb-4 mb-5">
              <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wider">
                {editingFaq ? 'Ubah FAQ' : 'Tambah FAQ Baru'}
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
              
              {/* Question */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Pertanyaan FAQ
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bagaimana cara membeli akun game?"
                  {...register('question')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45"
                />
                {errors.question && (
                  <span className="text-[10px] text-sold font-bold block">{errors.question.message}</span>
                )}
              </div>

              {/* Answer */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block">
                  Jawaban FAQ (Mendukung tag HTML sederhana seperti &lt;br&gt;)
                </label>
                <textarea
                  rows={5}
                  placeholder="Tulis jawaban lengkap FAQ di sini..."
                  {...register('answer')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45 resize-none leading-relaxed font-sans"
                />
                {errors.answer && (
                  <span className="text-[10px] text-sold font-bold block">{errors.answer.message}</span>
                )}
              </div>

              {/* Order Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-gray uppercase tracking-wider block font-mono">
                  Indeks Urutan (order_num)
                </label>
                <input
                  type="number"
                  placeholder="1"
                  {...register('order_num')}
                  className="w-full px-3 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45"
                />
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
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-dark text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-dark" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan FAQ</span>
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
