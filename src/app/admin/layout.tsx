'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Grid,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Kelola Produk', href: '/admin/products', icon: ShoppingBag },
    { name: 'Kategori Game', href: '/admin/categories', icon: Grid },
    { name: 'Banners Slider', href: '/admin/banners', icon: ImageIcon },
    { name: 'Testimoni', href: '/admin/testimonials', icon: MessageSquare },
    { name: 'FAQ', href: '/admin/faqs', icon: HelpCircle },
    { name: 'Pengaturan Web', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari sistem?')) return;
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/admin/login');
        router.refresh();
      } else {
        alert('Gagal melakukan logout');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row text-white">
      
      {/* MOBILE HEADER BAR */}
      <header className="md:hidden bg-secondary border-b border-custom-border p-4 flex items-center justify-between z-40 sticky top-0">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-extrabold text-base tracking-tight">Admin Console</span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg text-muted-gray hover:text-white"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* SIDEBAR PANEL (Desktop and Mobile Drawer) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-secondary border-r border-custom-border flex flex-col justify-between transform transition-transform duration-300 md:relative md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col flex-grow">
          {/* Logo Brand Title (Desktop only) */}
          <div className="hidden md:flex items-center space-x-2 px-6 py-6 border-b border-custom-border/50">
            <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/25">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              Admin Console
            </span>
          </div>

          {/* User badge */}
          <div className="px-6 py-4 flex items-center space-x-3 border-b border-custom-border/30 bg-dark/30">
            <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate leading-none">Pengelola Web</span>
              <span className="text-[10px] text-primary font-bold mt-1 uppercase tracking-widest leading-none">Super Admin</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer group',
                    isActive
                      ? 'bg-primary text-dark font-black'
                      : 'text-muted-gray hover:text-white hover:bg-dark/30'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-105', isActive ? 'text-dark' : 'text-primary')} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions: Logout */}
        <div className="p-4 border-t border-custom-border/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold text-sold hover:bg-sold/10 hover:text-sold transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Keluar Panel</span>
          </button>
        </div>
      </aside>

      {/* Backdrop blur on Mobile when Sidebar open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN VIEWPORT CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0">
        <main className="flex-grow p-6 sm:p-8 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
