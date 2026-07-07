'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard, { Product } from '@/components/public/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, X, RotateCcw, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CatalogClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function CatalogClient({ initialProducts, categories }: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State hooks mapping to filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(
    searchParams.has('game') ? (searchParams.get('game') || '') : 'free-fire'
  );
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('min_price')) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('max_price')) || 15000000); // 15M limit
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  
  // Mobile drawer filter open state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Read URL parameters on load / change
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setCategory(
      searchParams.has('game') ? (searchParams.get('game') || '') : 'free-fire'
    );
    setStatus(searchParams.get('status') || 'all');
    setMinPrice(Number(searchParams.get('min_price')) || 0);
    setMaxPrice(Number(searchParams.get('max_price')) || 15000000);
    setSortBy(searchParams.get('sort') || 'latest');
  }, [searchParams]);

  // Update URL search parameters when states change
  const updateUrl = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === 0 || (key === 'status' && value === 'all') || (key === 'sort' && value === 'latest')) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.replace(`/catalog?${params.toString()}`);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrl({ q: val });
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    updateUrl({ game: val });
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    updateUrl({ status: val });
  };

  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    updateUrl({ min_price: min, max_price: max });
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    updateUrl({ sort: val });
  };

  const handlePriceDropdownChange = (val: string) => {
    if (val === 'under_1m') {
      handlePriceChange(0, 999999);
    } else if (val === 'over_1m') {
      handlePriceChange(1000000, 15000000);
    } else {
      handlePriceChange(0, 15000000);
    }
  };

  const getPriceDropdownValue = () => {
    if (minPrice === 0 && maxPrice === 999999) return 'under_1m';
    if (minPrice === 1000000 && maxPrice === 15000000) return 'over_1m';
    return 'all';
  };

  const resetAllFilters = () => {
    setSearch('');
    setCategory('free-fire');
    setStatus('all');
    setMinPrice(0);
    setMaxPrice(15000000);
    setSortBy('latest');
    router.replace('/catalog');
    setIsMobileFilterOpen(false);
  };

  // Filtered and Sorted Products calculations (Memoized for top speed)
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((prod) => {
        // Keyword Search match (title, game, rank, skins, heroes, description)
        const query = search.toLowerCase().trim();
        const matchesQuery =
          query === '' ||
          prod.name.toLowerCase().includes(query) ||
          prod.game_name.toLowerCase().includes(query) ||
          (prod.rank && prod.rank.toLowerCase().includes(query)) ||
          (prod.skin && prod.skin.toLowerCase().includes(query)) ||
          (prod.hero && prod.hero.toLowerCase().includes(query)) ||
          prod.description.toLowerCase().includes(query);

        // Category Filter match
        const matchesCategory =
          category === '' ||
          category === 'all' ||
          (prod.category && prod.category.slug === category) ||
          prod.game_name.toLowerCase().replace(/\s+/g, '-') === category;

        // Status Filter match
        const matchesStatus =
          status === 'all' || prod.status === status;

        // Price Filter match
        const matchesPrice = prod.price >= minPrice && prod.price <= maxPrice;

        return matchesQuery && matchesCategory && matchesStatus && matchesPrice;
      })
      .sort((a, b) => {
        // Sorting Logic
        if (sortBy === 'cheapest') return a.price - b.price;
        if (sortBy === 'expensive') return b.price - a.price;
        // 'latest' default (sort by date or database rank/id if date missing)
        return new Date(b.slug ? 1 : 0).getTime() - new Date(a.slug ? 1 : 0).getTime(); // Placeholder standard
      });
  }, [initialProducts, search, category, status, minPrice, maxPrice, sortBy]);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto flex-grow">
      {/* Top Header Row */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Katalog Akun Game Premium
        </h1>
        <p className="text-xs sm:text-sm text-muted-gray">
          Temukan koleksi akun game terbaik siap pakai dari berbagai game terpopuler.
        </p>
      </div>

      {/* Main Grid: Filters Sidebar (Desktop) + Product List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-3 bg-secondary/30 border border-custom-border p-6 rounded-2xl sticky top-24 space-y-6">
          <div className="flex items-center justify-between border-b border-custom-border/50 pb-4">
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filter Akun
            </h2>
            <button
              onClick={resetAllFilters}
              className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Search keyword input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Cari Kata Kunci</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Skin, rank, hero, dll..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray" />
            </div>
          </div>

          {/* Categories select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Kategori Game</label>
            <div className="flex flex-col space-y-1.5">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  category === '' || category === 'all'
                    ? 'bg-primary text-white font-extrabold'
                    : 'text-muted-gray hover:text-white hover:bg-secondary/40'
                }`}
              >
                Semua Game
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    category === cat.slug
                      ? 'bg-primary text-white font-extrabold'
                      : 'text-muted-gray hover:text-white hover:bg-secondary/40'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Status Akun</label>
            <div className="grid grid-cols-3 gap-1 bg-dark/60 border border-custom-border p-1 rounded-lg">
              {['all', 'ready', 'sold_out'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`text-center text-[10px] font-extrabold py-1.5 rounded-md uppercase tracking-wider transition-colors cursor-pointer ${
                    status === s
                      ? 'bg-primary text-white'
                      : 'text-muted-gray hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'Semua' : s === 'ready' ? 'Ready' : 'Sold'}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range inputs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Rentang Harga (IDR)</label>
            <div className="space-y-3">
              <select
                value={getPriceDropdownValue()}
                onChange={(e) => handlePriceDropdownChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark/60 border border-custom-border text-white text-xs focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">Semua Harga</option>
                <option value="under_1m">Di bawah Rp 1.000.000</option>
                <option value="over_1m">Rp 1.000.000 ke atas</option>
              </select>
            </div>
          </div>
        </aside>

        {/* PRODUCTS LIST COLUMN */}
        <main className="lg:col-span-9 space-y-6">
          {/* Controls Bar (Filter toggle for mobile, sort selector, and status counts) */}
          <div className="flex items-center justify-between bg-secondary/20 border border-custom-border/50 p-4 rounded-2xl gap-4">
            <span className="text-xs text-muted-gray font-bold">
              Menampilkan <span className="text-primary">{filteredProducts.length}</span> Akun
            </span>

            <div className="flex items-center space-x-2 shrink-0">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-secondary/80 text-white font-bold text-xs border border-custom-border hover:border-primary transition-all cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                <span>Filter</span>
              </button>

              {/* Sorting Selection */}
              <div className="relative flex items-center space-x-1">
                <ArrowUpDown className="h-3.5 w-3.5 text-primary pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white py-1.5 px-1 pr-4 focus:outline-none border-none cursor-pointer"
                >
                  <option value="latest" className="bg-dark text-white">Terbaru</option>
                  <option value="cheapest" className="bg-dark text-white">Termurah</option>
                  <option value="expensive" className="bg-dark text-white">Termahal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid display */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-custom-border p-16 text-center rounded-2xl bg-secondary/10 max-w-lg mx-auto">
              <SlidersHorizontal className="h-10 w-10 text-muted-gray mx-auto mb-4" />
              <h3 className="font-bold text-white text-base mb-1">Hasil Tidak Ditemukan</h3>
              <p className="text-xs sm:text-sm text-muted-gray mb-6 leading-relaxed">
                Tidak ada akun game yang cocok dengan filter pencarian Anda. Coba reset filter atau cari kata kunci lain.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-dark font-extrabold text-xs transition-colors cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE DRAWER FILTER (Drawer dialog backdrop) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          
          {/* Drawer sheet */}
          <div className="relative w-80 max-w-full bg-dark h-full border-l border-custom-border p-6 flex flex-col justify-between z-10 shadow-2xl">
            <div className="space-y-6 overflow-y-auto pr-1 no-scrollbar pb-8">
              <div className="flex items-center justify-between border-b border-custom-border/50 pb-4">
                <h2 className="font-extrabold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Filter Akun
                </h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-md text-muted-gray hover:text-white hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search keyword input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-wider block">Cari Kata Kunci</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Skin, rank, hero, dll..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/50 border border-custom-border text-white text-xs focus:outline-none focus:border-primary"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-gray" />
                </div>
              </div>

              {/* Categories select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-wider block">Kategori Game</label>
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      category === '' || category === 'all'
                        ? 'bg-primary text-white font-extrabold'
                        : 'text-muted-gray hover:text-white hover:bg-secondary/40'
                    }`}
                  >
                    Semua Game
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        category === cat.slug
                          ? 'bg-primary text-white font-extrabold'
                          : 'text-muted-gray hover:text-white hover:bg-secondary/40'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-wider block">Status Akun</label>
                <div className="grid grid-cols-3 gap-1 bg-secondary/50 border border-custom-border p-1 rounded-lg">
                  {['all', 'ready', 'sold_out'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`text-center text-[10px] font-extrabold py-1.5 rounded-md uppercase tracking-wider transition-colors cursor-pointer ${
                        status === s
                          ? 'bg-primary text-white'
                          : 'text-muted-gray hover:text-white'
                      }`}
                    >
                      {s === 'all' ? 'Semua' : s === 'ready' ? 'Ready' : 'Sold'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white uppercase tracking-wider block">Rentang Harga (IDR)</label>
                <div className="space-y-2">
                  <select
                    value={getPriceDropdownValue()}
                    onChange={(e) => handlePriceDropdownChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-custom-border text-white text-xs focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="all">Semua Harga</option>
                    <option value="under_1m">Di bawah Rp 1.000.000</option>
                    <option value="over_1m">Rp 1.000.000 ke atas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reset & Apply controls drawer bottom */}
            <div className="border-t border-custom-border pt-4 grid grid-cols-2 gap-3 mt-auto shrink-0 bg-dark z-20">
              <button
                onClick={resetAllFilters}
                className="w-full py-2.5 rounded-lg border border-custom-border text-white hover:bg-secondary text-xs font-bold transition-all cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all cursor-pointer"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
