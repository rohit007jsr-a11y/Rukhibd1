import React from 'react';
import { CUSTOMER_REVIEWS } from '../data/mockData';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const CodTrustBanner: React.FC = () => {
  return (
    <section className="py-16 bg-[#F7F7F5] border-b-2 border-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="font-heading font-black text-xs text-[#E63946] uppercase tracking-widest">
            REAL BANGLADESH CUSTOMER REVIEWS
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#111111] uppercase tracking-tight">
            Verified COD Experiences
          </h2>
          <p className="text-xs text-neutral-600 font-body">
            Read authentic feedback from customers across Dhaka, Chittagong, Sylhet, and Rajshahi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CUSTOMER_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border-2 border-[#111111] p-6 shadow-[6px_6px_0px_#111111] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500 gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified COD
                  </span>
                </div>

                <p className="text-xs text-neutral-700 font-body italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <div className="font-heading font-black text-xs uppercase text-[#111111]">
                  {rev.author}
                </div>
                <div className="text-[11px] text-neutral-500 font-semibold">
                  {rev.district} • <span className="text-[#E63946]">{rev.productName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
