'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Search, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SiteSettings } from '@/lib/settings';

interface NavbarProps {
  settings: SiteSettings;
}

export default function Navbar({ settings }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Synchronize theme on load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Katalog Akun', href: '/catalog' },
    { name: 'Tentang Kami', href: '/about' },
    { name: 'FAQ', href: '/#faq' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-4 sm:px-6 md:px-8',
        isScrolled
          ? 'bg-dark/85 backdrop-blur-md border-b border-custom-border/80 shadow-lg shadow-black/20'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-primary/20 group-hover:border-primary/50 transition-colors bg-secondary flex items-center justify-center p-1">
            <Image
              src="/logo.png"
              alt="JBRENDYR"
              width={32}
              height={32}
              className="object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent group-hover:text-primary transition-colors">
            {settings.site_name}
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-semibold transition-colors duration-200 relative py-1 hover:text-primary',
                  isActive ? 'text-primary' : 'text-muted-gray'
                )}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons (WhatsApp, Theme Toggle) */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-custom-border hover:border-primary text-muted-gray hover:text-primary transition-all cursor-pointer bg-secondary/40"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <a
            href={`https://wa.me/${settings.whatsapp_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-95 cursor-pointer"
          >
            <Phone className="h-4 w-4" />
            <span>Hubungi Admin</span>
          </a>
        </div>

        {/* Mobile menu button & Theme Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-custom-border text-muted-gray hover:text-primary transition-all bg-secondary/40 cursor-pointer"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-muted-gray hover:text-white hover:bg-secondary border border-transparent hover:border-custom-border transition-all"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <div
        className={cn(
          'fixed inset-x-0 top-[73px] bg-dark/95 border-b border-custom-border px-6 py-8 md:hidden flex flex-col space-y-6 shadow-2xl transition-all duration-300 ease-in-out transform',
          isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'
        )}
      >
        <div className="flex flex-col space-y-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'text-base font-bold py-2 border-b border-custom-border/30 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-gray'
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <a
          href={`https://wa.me/${settings.whatsapp_number}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setIsOpen(false)}
          className="flex items-center justify-center space-x-2 w-full py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-base transition-all duration-300 shadow-lg shadow-primary/10 cursor-pointer"
        >
          <Phone className="h-5 w-5" />
          <span>Hubungi Kami</span>
        </a>
      </div>
    </nav>
  );
}
