'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/schema-validation';
import { z } from 'zod';
import { ShieldCheck, Eye, EyeOff, Loader2, KeyRound, Mail } from 'lucide-react';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/admin/dashboard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectedFrom = params.get('redirectedFrom');
    if (redirectedFrom) setRedirectTo(redirectedFrom);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat masuk');
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Gagal tersambung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-dark flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="w-full max-w-md bg-secondary/65 border border-custom-border p-8 rounded-2xl shadow-2xl relative z-10 backdrop-blur-md">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="relative w-20 h-20 mb-4 rounded-full overflow-hidden border-2 border-custom-border bg-dark shadow-xl">
            <img src="/logo.png" alt="JBRENDYR Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Login Sistem
          </h1>
          <p className="text-xs text-muted-gray mt-1.5 uppercase font-bold tracking-widest">
            JBRENDYR.COM
          </p>
        </div>

        {error && (
          <div className="bg-sold/10 border border-sold/25 text-sold text-xs rounded-xl p-3 mb-6 font-bold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-gray block">
              Username / Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="text"
                placeholder="rendyr atau rendyr@jbrendyr.com"
                {...register('email')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray" />
            </div>
            {errors.email && (
              <span className="text-[10px] text-sold font-bold block">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-gray block">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary placeholder-muted-gray/45"
              />
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] text-sold font-bold block">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-primary hover:bg-primary-dark text-dark font-extrabold text-sm transition-all duration-300 shadow-md shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer mt-2 disabled:bg-primary/50 disabled:text-dark/50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-dark" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>MASUK KE DASHBOARD</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => {
              setIsGoingBack(true);
              router.push('/');
            }}
            disabled={isGoingBack || isLoading}
            className="text-[10px] sm:text-xs text-muted-gray hover:text-primary transition-colors font-bold uppercase tracking-widest cursor-pointer inline-flex items-center justify-center space-x-1.5 disabled:opacity-50 mx-auto"
          >
            {isGoingBack ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menuju Toko...</span>
              </>
            ) : (
              <span>← Kembali ke Toko</span>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
