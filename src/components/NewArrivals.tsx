import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface NewArrivalsProps {
  onExploreClick: () => void;
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({ onExploreClick }) => {
  return (
    <section className="py-16 bg-white border-b-2 border-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111111] text-white p-8 md:p-12 border-2 border-[#111111] shadow-[8px_8px_0px_#E63946] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#E63946] text-white px-3 py-1 font-heading font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Weekly Drop</span>
            </div>

            <h2 className="font-heading font-black text-3xl sm:text-4xl uppercase tracking-tight text-white">
              New Season Collections Just Arrived
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 font-body">
              Explore 100+ new electronics gadgets, panjabi designs, kitchen accessories, and skincare products updated daily.
            </p>
          </div>

          <button
            onClick={onExploreClick}
            className="bg-white text-[#111111] font-heading font-black text-sm uppercase px-8 py-4 shadow-[4px_4px_0px_#E63946] hover:bg-[#E63946] hover:text-white transition-all cursor-pointer flex items-center gap-3 whitespace-nowrap"
          >
            <span>Shop New Arrivals</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
