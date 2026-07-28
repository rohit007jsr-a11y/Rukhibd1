import React from 'react';
import { Truck, ShieldCheck, ArrowRight, PackageCheck, Banknote } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

interface HeroProps {
  onShopClick: () => void;
  onExploreCategoriesClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, onExploreCategoriesClick }) => {
  const { siteContent } = useSiteContent();
  const hero = (siteContent.hero_banner || {}) as any;
  const badgeText = hero.badge_text || 'Zero Advance Payment • 100% Cash On Delivery';
  const title = hero.title || 'CHECK YOUR PARCEL BEFORE PAYING CASH';
  const subtitle = hero.subtitle || 'Welcome to Rukhi. We deliver genuine electronics, fashion, home goods, and beauty products across all 64 districts in Bangladesh with 100% Cash-on-Delivery. Inspect your order at your doorstep before handing over payment.';
  const buttonText = hero.button_text || 'BROWSE PRODUCTS';

  return (
    <section className="relative bg-[#F7F7F5] border-b-2 border-[#111111] overflow-hidden py-8 sm:py-12 md:py-20 w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center">
          {/* Main Headline */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex max-w-full items-center gap-1.5 bg-[#111111] text-white px-2.5 py-1 text-[10px] sm:text-xs font-heading font-black uppercase tracking-wider border-2 border-[#E63946] shadow-[2px_2px_0px_#E63946]">
              <Banknote className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0" />
              <span className="truncate">{badgeText}</span>
            </div>

            <h1 className="font-heading font-black text-2xl xs:text-3xl sm:text-5xl lg:text-6xl text-[#111111] leading-tight uppercase tracking-tight break-words">
              {title}
            </h1>

            <p className="text-xs sm:text-base md:text-lg text-neutral-700 font-body max-w-2xl leading-relaxed">
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onShopClick}
                className="bg-[#111111] text-white font-heading font-black text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-8 py-3.5 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 shadow-[4px_4px_0px_#E63946] sm:shadow-[6px_6px_0px_#E63946] hover:bg-[#E63946] hover:shadow-[2px_2px_0px_#111111] active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={onExploreCategoriesClick}
                className="bg-white text-[#111111] font-heading font-black text-xs sm:text-sm uppercase tracking-wider px-5 sm:px-6 py-3.5 sm:py-4 border-2 border-[#111111] shadow-[3px_3px_0px_#111111] sm:shadow-[4px_4px_0px_#111111] hover:bg-[#F0EDEA] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
              >
                Explore Categories
              </button>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-4 sm:pt-6 border-t-2 border-[#111111]">
              <div className="p-2.5 sm:p-3 bg-white border border-[#111111] shadow-[2px_2px_0px_#111111]">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-heading font-bold uppercase text-[#111111]">
                  <Truck className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0" />
                  <span>Fast Delivery</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-600 mt-1">24-48h Dhaka, 2-4 days nationwide</p>
              </div>

              <div className="p-2.5 sm:p-3 bg-white border border-[#111111] shadow-[2px_2px_0px_#111111]">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-heading font-bold uppercase text-[#111111]">
                  <PackageCheck className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0" />
                  <span>Parcel Inspection</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-600 mt-1">Open & verify in front of rider</p>
              </div>

              <div className="p-2.5 sm:p-3 bg-white border border-[#111111] shadow-[2px_2px_0px_#111111] col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-heading font-bold uppercase text-[#111111]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0" />
                  <span>Easy Return</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-600 mt-1">Instant return if damaged or wrong</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-white border-2 border-[#111111] p-4 shadow-[10px_10px_0px_#111111] space-y-4">
              <div className="aspect-4/3 relative overflow-hidden border-2 border-[#111111]">
                <img
                  src="https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=1000&q=80"
                  alt="Rukhi COD Marketplace"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 bg-[#E63946] text-white font-heading font-black text-xs uppercase px-3 py-1 border border-[#111111] shadow-[3px_3px_0px_#111111]">
                  HOT COD SELLER
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold uppercase text-neutral-500">
                    Home & Executive Furniture
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                    In Stock Dhaka
                  </span>
                </div>

                <h3 className="font-heading font-black text-lg text-[#111111] uppercase leading-tight">
                  Ergonomic Mesh Executive Chair
                </h3>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                  <div>
                    <span className="text-xs text-neutral-400 line-through mr-2">৳ 8,500</span>
                    <span className="font-heading font-black text-xl text-[#E63946]">৳ 6,850</span>
                  </div>

                  <span className="text-xs font-bold text-[#111111] bg-[#F7F7F5] px-2.5 py-1 border border-[#111111]">
                    Pay ৳ 6,850 Cash
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
