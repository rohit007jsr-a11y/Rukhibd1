import React from 'react';
import { CATEGORIES } from '../data/mockData';
import { ArrowRight, Layers } from 'lucide-react';

interface CategoryGridProps {
  onSelectCategory: (catId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  return (
    <section id="categories" className="py-12 bg-white border-b-2 border-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-heading font-black text-[#E63946] uppercase tracking-widest mb-1">
              <Layers className="w-4 h-4" />
              <span>Explore Marketplace Categories</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#111111] uppercase tracking-tight">
              Shop By Category
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md font-body">
            All categories include 100% Cash on Delivery across all 64 districts in Bangladesh.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group cursor-pointer bg-[#F7F7F5] border-2 border-[#111111] p-3.5 sm:p-4 shadow-[4px_4px_0px_#111111] sm:shadow-[6px_6px_0px_#111111] hover:shadow-[2px_2px_0px_#E63946] hover:border-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <div className="aspect-4/3 overflow-hidden border-2 border-[#111111] relative mb-4">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 right-2 bg-[#111111] text-white font-heading font-black text-[10px] uppercase px-2 py-0.5 border border-[#E63946]">
                  {cat.itemCount} Items
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-black text-base text-[#111111] uppercase group-hover:text-[#E63946] transition-colors">
                  {cat.name}
                </h3>

                <div className="flex flex-wrap gap-1">
                  {cat.subcategories.slice(0, 3).map((sub, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold text-neutral-600 bg-white px-2 py-0.5 border border-neutral-300"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-heading font-bold uppercase text-[#111111]">
                  <span>Browse Products</span>
                  <ArrowRight className="w-4 h-4 text-[#E63946] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
