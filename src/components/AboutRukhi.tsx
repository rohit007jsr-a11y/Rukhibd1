import React from 'react';
import { MapPin, ShieldAlert, Award, ThumbsUp } from 'lucide-react';

export const AboutRukhi: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-[#F7F7F5] border-b-2 border-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-2 border-[#111111] p-8 md:p-12 shadow-[8px_8px_0px_#111111] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="bg-[#E63946] text-white font-heading font-black text-xs uppercase px-3 py-1 border border-[#111111]">
              MADE FOR BANGLADESH
            </span>

            <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#111111] uppercase tracking-tight">
              Solving Online Shopping Trust In Bangladesh
            </h2>

            <p className="text-xs sm:text-sm text-neutral-700 font-body leading-relaxed">
              Online shopping in Bangladesh often comes with anxiety—will the product match the photo? Is advance bkash payment safe? At <strong className="text-[#111111]">Rukhi</strong>, we eliminated all doubt by offering strict 100% Cash-on-Delivery across all product lines.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#111111] text-white flex items-center justify-center font-heading font-black text-sm border-2 border-[#E63946]">
                  64
                </div>
                <div>
                  <div className="font-heading font-bold text-xs uppercase text-[#111111]">Districts Covered</div>
                  <div className="text-[11px] text-neutral-500">Dhaka to Teknaf</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#111111] text-white flex items-center justify-center font-heading font-black text-sm border-2 border-[#E63946]">
                  0৳
                </div>
                <div>
                  <div className="font-heading font-bold text-xs uppercase text-[#111111]">Advance Charge</div>
                  <div className="text-[11px] text-neutral-500">Pay when holding parcel</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#111111] text-white p-6 border-2 border-[#111111] shadow-[6px_6px_0px_#E63946] space-y-4">
            <div className="flex items-center gap-2 text-[#E63946] font-heading font-black text-sm uppercase">
              <ShieldAlert className="w-5 h-5" />
              <span>Rukhi Quality Protocol</span>
            </div>

            <ul className="space-y-3 text-xs text-neutral-300 font-body">
              <li className="flex items-start gap-2">
                <span className="text-[#E63946] font-bold">✓</span>
                <span>Every product is QC tested at our Dhaka warehouse before dispatch.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E63946] font-bold">✓</span>
                <span>No hidden fees, no required digital wallet prepayments.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E63946] font-bold">✓</span>
                <span>Direct customer hotline available for delivery scheduling.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
