import { Loader2 } from 'lucide-react';

export default function PublicLoading() {
  return (
    <div className="flex-grow bg-dark flex flex-col justify-center items-center py-32 px-4 text-center min-h-[60vh] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Glowing loader icon container */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full border border-primary/20 animate-ping pointer-events-none" />
          <div className="absolute w-20 h-20 rounded-full border-t-2 border-r-2 border-primary/30 animate-spin duration-1000 pointer-events-none" />
          
          <div className="w-12 h-12 bg-secondary border border-custom-border rounded-xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(255,43,60,0.15)]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </div>

        {/* Loading messages */}
        <div className="space-y-1.5">
          <h3 className="text-white font-extrabold text-sm sm:text-base tracking-wider uppercase">
            Memuat Halaman...
          </h3>
          <p className="text-xs text-muted-gray uppercase tracking-widest font-semibold animate-pulse">
            Menghubungkan ke Server JBRENDYR
          </p>
        </div>
      </div>
    </div>
  );
}
