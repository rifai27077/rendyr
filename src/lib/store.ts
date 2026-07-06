import { create } from 'zustand';

interface FilterState {
  searchQuery: string;
  selectedCategory: string; // empty string for 'All'
  selectedStatus: string;   // 'all', 'ready', 'sold_out'
  priceRange: [number, number];
  sortBy: string;           // 'latest', 'cheapest', 'expensive', 'popular'
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (slug: string) => void;
  setSelectedStatus: (status: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortBy: (sort: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  selectedCategory: '',
  selectedStatus: 'all',
  priceRange: [0, 50000000], // default broad range (up to 50M IDR)
  sortBy: 'latest',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (slug) => set({ selectedCategory: slug }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setPriceRange: (range) => set({ priceRange: range }),
  setSortBy: (sort) => set({ sortBy: sort }),
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedCategory: '',
      selectedStatus: 'all',
      priceRange: [0, 50000000],
      sortBy: 'latest',
    }),
}));
