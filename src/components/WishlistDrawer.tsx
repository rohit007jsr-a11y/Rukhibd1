import React from 'react';
import { Product } from '../types';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  wishlistProducts: Product[];
  onClose: () => void;
  onRemoveFromWishlist: (product: Product) => void;
  onMoveToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  wishlistProducts,
  onClose,
  onRemoveFromWishlist,
  onMoveToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l-2 border-[#111111] shadow-2xl flex flex-col justify-between h-full max-h-full overflow-hidden">
          <div className="p-4 bg-[#111111] text-white flex items-center justify-between border-b-2 border-[#E63946]">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#E63946] fill-current" />
              <h2 className="font-heading font-black text-sm uppercase tracking-wider">
                Saved Wishlist ({wishlistProducts.length})
              </h2>
            </div>
            <button onClick={onClose} className="p-1 hover:text-[#E63946] transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {wishlistProducts.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Heart className="w-12 h-12 text-neutral-300 mx-auto" />
                <p className="font-heading font-bold text-sm uppercase text-neutral-500">
                  Your wishlist is empty
                </p>
              </div>
            ) : (
              wishlistProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-3 bg-[#F7F7F5] border-2 border-[#111111] p-3 shadow-[3px_3px_0px_#111111]"
                >
                  <img
                    src={p.image_url || p.image}
                    alt={p.name}
                    className="w-16 h-16 object-cover border border-[#111111] flex-shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-heading font-bold text-xs uppercase line-clamp-1 text-[#111111]">
                      {p.name}
                    </h4>
                    <div className="font-heading font-black text-sm text-[#E63946]">
                      ৳ {Number(p.price).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onMoveToCart(p)}
                        className="bg-[#111111] text-white font-heading font-bold text-[10px] uppercase px-2 py-1 flex items-center gap-1 hover:bg-[#E63946] transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move To Cart</span>
                      </button>
                      <button
                        onClick={() => onRemoveFromWishlist(p)}
                        className="text-neutral-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
