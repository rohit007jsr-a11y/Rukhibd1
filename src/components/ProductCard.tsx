import React from 'react';
import { Product } from '../types';
import { Star, ShoppingBag, Eye, Heart, Truck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
}) => {
  const imageUrl = product.image_url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  const price = Number(product.price);
  const originalPrice = product.originalPrice || product.original_price;

  return (
    <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] sm:shadow-[6px_6px_0px_#111111] hover:shadow-[2px_2px_0px_#E63946] transition-all flex flex-col justify-between group overflow-hidden">
      <div>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-[#F7F7F5] border-b-2 border-[#111111]">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className="bg-[#111111] text-white font-heading font-black text-[10px] uppercase px-2 py-0.5 border border-[#E63946] shadow-[2px_2px_0px_#E63946]">
              {product.badge || 'COD AVAILABLE'}
            </span>
            {originalPrice && (
              <span className="bg-[#E63946] text-white font-heading font-black text-[10px] uppercase px-2 py-0.5 border border-[#111111]">
                SAVE ৳{originalPrice - price}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-2 bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#E63946] hover:text-white transition-colors cursor-pointer ${
                isWishlisted ? 'bg-[#E63946] text-white' : 'text-[#111111]'
              }`}
              title="Save to wishlist"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => onQuickView(product)}
              className="p-2 bg-white text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#111111] hover:text-white transition-colors cursor-pointer"
              title="Quick inspect"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* COD Tag Banner */}
          <div className="absolute bottom-0 inset-x-0 bg-[#111111]/90 text-white text-[10px] font-heading font-bold uppercase py-1 px-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#E63946]">
              <Truck className="w-3 h-3" />
              Pay Cash On Delivery
            </span>
            <span className="text-emerald-400">0 Advance</span>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-semibold uppercase">
            <span>{product.category}</span>
            <div className="flex items-center gap-1 text-amber-600 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{product.rating || 4.8}</span>
            </div>
          </div>

          <h3 className="font-heading font-bold text-sm text-[#111111] uppercase line-clamp-2 leading-tight group-hover:text-[#E63946] transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-neutral-600 line-clamp-2 font-body">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer Price & Add to Cart */}
      <div className="p-4 pt-0 space-y-3">
        <div className="flex items-baseline justify-between border-t border-neutral-200 pt-3">
          <div>
            {originalPrice && (
              <span className="text-xs text-neutral-400 line-through mr-2">
                ৳ {originalPrice.toLocaleString()}
              </span>
            )}
            <span className="font-heading font-black text-lg text-[#111111]">
              ৳ {price.toLocaleString()}
            </span>
          </div>

          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
            Check parcel
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className="w-full bg-[#111111] text-white font-heading font-black text-xs uppercase py-3 flex items-center justify-center gap-2 shadow-[4px_4px_0px_#E63946] hover:bg-[#E63946] hover:shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-[#E63946] group-hover:text-white" />
          <span>Add To COD Cart</span>
        </button>
      </div>
    </div>
  );
};
