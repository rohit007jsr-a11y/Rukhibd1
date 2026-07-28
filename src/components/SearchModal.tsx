import React, { useState } from 'react';
import { Product } from '../types';
import { PRODUCTS, CATEGORIES } from '../data/mockData';
import { Search, X, ArrowRight, Tag } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  onSelectCategory: (catId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSelectCategory,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const filtered = query.trim() === ''
    ? []
    : PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(query.toLowerCase()))
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border-2 border-[#111111] shadow-[8px_8px_0px_#111111] overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 bg-[#111111] flex items-center gap-3 border-b-2 border-[#E63946]">
          <Search className="w-5 h-5 text-[#E63946]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search electronics, panjabi, chairs, skincare..."
            className="flex-1 bg-transparent text-white font-heading font-bold text-sm uppercase placeholder:text-neutral-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results / Suggestions */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {query.trim() === '' ? (
            <div className="space-y-4">
              <h4 className="font-heading font-black text-xs uppercase text-neutral-400 tracking-wider">
                Popular Categories
              </h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className="p-2.5 bg-[#F7F7F5] border border-[#111111] text-xs font-heading font-bold uppercase hover:bg-[#E63946] hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 font-heading font-bold text-xs uppercase">
              No products match "{query}"
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    onClose();
                  }}
                  className="p-3 bg-[#F7F7F5] border-2 border-[#111111] hover:border-[#E63946] shadow-[3px_3px_0px_#111111] flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image_url || p.image}
                      alt={p.name}
                      className="w-12 h-12 object-cover border border-[#111111]"
                    />
                    <div>
                      <h5 className="font-heading font-bold text-xs uppercase text-[#111111]">
                        {p.name}
                      </h5>
                      <span className="font-heading font-black text-xs text-[#E63946]">
                        ৳ {Number(p.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#111111]" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
