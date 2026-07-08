

export default function PublicLoading() {
  return (
    <div className="flex-grow bg-dark">
      {/* 1. HERO SECTION SKELETON */}
      <section className="relative pt-28 pb-24 md:py-32 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          {/* Banner Slider Skeleton */}
          <div className="w-full h-[200px] md:h-[400px] bg-secondary/50 rounded-2xl mb-10 animate-pulse" />
          
          {/* Title & Subtitle Skeleton */}
          <div className="w-48 h-6 bg-secondary/50 rounded-full mb-6 animate-pulse" />
          <div className="w-3/4 max-w-2xl h-12 md:h-16 bg-secondary/50 rounded-xl mb-5 animate-pulse" />
          <div className="w-1/2 max-w-lg h-4 bg-secondary/50 rounded-full mb-8 animate-pulse" />
          
          {/* Search bar Skeleton */}
          <div className="w-full max-w-xl h-14 bg-secondary/50 rounded-xl animate-pulse" />
        </div>
      </section>

      {/* 2. GAME CATEGORIES SKELETON */}
      <section className="py-16 bg-secondary/10 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between mb-10">
            <div className="w-48 h-8 bg-secondary/50 rounded-lg animate-pulse" />
            <div className="w-24 h-4 bg-secondary/50 rounded-lg hidden sm:block animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-secondary/40 h-28 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* 3. LATEST PRODUCTS SKELETON */}
      <section className="py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between mb-12">
          <div className="w-64 h-8 bg-secondary/50 rounded-lg animate-pulse" />
          <div className="w-24 h-4 bg-secondary/50 rounded-lg hidden sm:block animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-secondary/40 h-80 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}
