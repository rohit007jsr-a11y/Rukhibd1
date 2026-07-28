import React, { useState } from 'react';
import { Product } from '../types';
import { X, Star, ShoppingBag, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || 'Default');

  const imageUrl = product.image_url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  const price = Number(product.price);
  const originalPrice = product.originalPrice || product.original_price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border-2 border-[#111111] shadow-[8px_8px_0px_#111111] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 bg-[#111111] text-white hover:bg-[#E63946] transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
          {/* Image */}
          <div className="space-y-3">
            <div className="aspect-square border-2 border-[#111111] bg-[#F7F7F5] overflow-hidden relative">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-[#E63946] text-white font-heading font-black text-[10px] uppercase px-2 py-0.5 border border-[#111111]">
                100% COD AVAILABLE
              </span>
            </div>
          </div>

          {/* Product Specs */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-heading font-bold text-[#E63946] uppercase">
                {product.category}
              </span>

              <h2 className="font-heading font-black text-xl text-[#111111] uppercase leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                </div>
                <span className="font-bold text-[#111111]">{product.rating || 4.8} / 5.0</span>
                <span className="text-neutral-400">• Verified Product</span>
              </div>

              <div className="flex items-baseline gap-3 pt-2 border-t border-neutral-200">
                <span className="font-heading font-black text-2xl text-[#111111]">
                  ৳ {price.toLocaleString()}
                </span>
                {originalPrice && (
                  <span className="text-sm text-neutral-400 line-through">
                    ৳ {originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-600 font-body leading-relaxed">
                {product.description}
              </p>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="block text-xs font-heading font-bold text-[#111111] uppercase">
                  Select Quantity
                </label>
                <div className="flex items-center border-2 border-[#111111] w-32">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 py-1 bg-[#F7F7F5] font-bold text-sm hover:bg-neutral-200 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-heading font-bold text-xs">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 py-1 bg-[#F7F7F5] font-bold text-sm hover:bg-neutral-200 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero advance required. Pay cash upon inspecting parcel.</span>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product, quantity, selectedSize, selectedColor);
                  onClose();
                }}
                className="w-full bg-[#111111] text-white font-heading font-black text-xs uppercase py-3.5 flex items-center justify-center gap-2 shadow-[4px_4px_0px_#E63946] hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#E63946]" />
                <span>Add To Cash On Delivery Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
