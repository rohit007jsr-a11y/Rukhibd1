import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORIES, PRODUCTS } from '../data/mockData';
import { Package } from 'lucide-react';

interface FeaturedProductsProps {
  products?: Product[];
  activeCategory: string;
  wishlistIds: (string | number)[];
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onSelectCategory: (catId: string) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  activeCategory,
  wishlistIds,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  onSelectCategory,
}) => {
  const itemsToDisplay = (products && products.length > 0) ? products : PRODUCTS;
  const filtered = activeCategory === 'all'
    ? itemsToDisplay
    : itemsToDisplay.filter((p) => p.category === activeCategory);

  return (
    <section id="shop" className="py-16 bg-[#F7F7F5] border-b-2 border-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-heading font-black text-[#E63946] uppercase tracking-widest mb-1">
              <Package className="w-4 h-4" />
              <span>Verified Genuine Quality</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#111111] uppercase tracking-tight">
              Featured Products (COD)
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-4 py-2 font-heading font-black text-xs uppercase tracking-wider border-2 border-[#111111] cursor-pointer transition-all whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-[#111111] text-white shadow-[3px_3px_0px_#E63946]'
                  : 'bg-white text-[#111111] hover:bg-[#F0EDEA]'
              }`}
            >
              All Items
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 font-heading font-bold text-xs uppercase tracking-wider border-2 border-[#111111] cursor-pointer transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#111111] text-white shadow-[3px_3px_0px_#E63946]'
                    : 'bg-white text-[#111111] hover:bg-[#F0EDEA]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              isWishlisted={wishlistIds.includes(prod.id)}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
