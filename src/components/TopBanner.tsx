import React from 'react';
import { ShieldCheck, PhoneCall, MapPin } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

export const TopBanner: React.FC = () => {
  const { siteContent } = useSiteContent();
  const bannerText = siteContent.top_banner?.text || 'Cash on Delivery Across All 64 Districts';

  return (
    <div className="bg-[#111111] text-white py-1.5 px-3 border-b-2 border-[#E63946] text-[11px] sm:text-xs font-body overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
        <div className="flex items-center gap-1.5 font-medium justify-center sm:justify-start">
          <span className="bg-[#E63946] text-white text-[9px] sm:text-[10px] font-heading font-black px-1.5 py-0.5 uppercase tracking-wider shadow-[2px_2px_0px_#FFFFFF] whitespace-nowrap">
            100% COD
          </span>
          <span className="truncate max-w-[280px] xs:max-w-none">{bannerText}</span>
        </div>

        <div className="flex items-center justify-center gap-3 text-[10px] sm:text-[11px] text-gray-300">
          <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
            <ShieldCheck className="w-3 h-3 text-[#E63946]" />
            <span>Open Parcel First</span>
          </div>
          <div className="hidden md:flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
            <MapPin className="w-3 h-3 text-[#E63946]" />
            <span>Dhaka Express</span>
          </div>
          <a
            href="tel:09612345678"
            className="flex items-center gap-1 font-bold text-white hover:text-[#E63946] transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-[#E63946]" />
            <span>09612-345678</span>
          </a>
        </div>
      </div>
    </div>
  );
};

