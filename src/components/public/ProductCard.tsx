import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Eye, Sparkles, User, Sword } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface Product {
  id: string;
  name: string;
  game_name: string;
  slug: string;
  price: number;
  thumbnail: string;
  status: 'ready' | 'sold_out';
  rank?: string | null;
  skin?: string | null;
  hero?: string | null;
  gallery?: string[];
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isReady = product.status === 'ready';

  return (
    <div className="relative bg-secondary/40 border border-custom-border rounded-2xl overflow-hidden flex flex-col group glow-hover h-full">
      {/* Product Image Wrapper */}
      <Link
        href={`/product/${product.slug}`}
        className="relative w-full aspect-video overflow-hidden shrink-0 block cursor-pointer"
      >
        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md border ${
              isReady
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-sold/10 text-sold border-sold/20'
            }`}
          >
            {isReady ? 'Tersedia' : 'Terjual'}
          </span>
        </div>

        {/* Product Category Label */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dark/70 text-white border border-custom-border/50">
            {product.game_name}
          </span>
        </div>

        <Image
          src={product.thumbnail}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Hover overlay detail button */}
        <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-10">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary text-white font-extrabold text-xs transition-transform transform translate-y-2 group-hover:translate-y-0 duration-300">
            <Eye className="h-4 w-4" />
            <span>Lihat Detail</span>
          </div>
        </div>
      </Link>

      {/* Product Details Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <Link href={`/product/${product.slug}`} className="cursor-pointer">
          <h3 className="font-extrabold text-base text-white hover:text-primary line-clamp-1 transition-colors mb-1 leading-snug">
            {product.name}
          </h3>
        </Link>
        
        {/* Game Title Subtitle */}
        <span className="text-xs text-muted-gray mb-5 block">
          Game: {product.game_name}
        </span>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between border-t border-custom-border/40 pt-4 mt-auto">
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-gray uppercase font-semibold tracking-wider">Harga</span>
            <span className="font-extrabold text-base text-primary leading-none">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <Link
            href={`/product/${product.slug}`}
            className="px-3.5 py-2 rounded-lg bg-secondary/80 hover:bg-primary hover:text-white text-white font-bold text-xs border border-custom-border/80 hover:border-transparent transition-all cursor-pointer"
          >
            Detail
          </Link>
        </div>
      </div>
    </div>
  );
}
