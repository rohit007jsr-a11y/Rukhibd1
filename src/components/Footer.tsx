import React from 'react';
import { CATEGORIES } from '../data/mockData';
import { PhoneCall, MapPin, Mail, ShieldCheck, Truck } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

interface FooterProps {
  onSelectCategory: (catId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  const { siteContent } = useSiteContent();
  const footerData = (siteContent.footer || {}) as any;
  const heading = footerData.heading || 'RUKHI BANGLADESH';
  const description = footerData.description || "Bangladesh's trusted multi-category Cash-on-Delivery e-commerce marketplace.";
  const phone = footerData.contact_phone || '09612-345678';
  const email = footerData.contact_email || 'support@rukhi.com.bd';

  return (
    <footer className="bg-[#111111] text-white border-t-2 border-[#111111] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white text-[#111111] flex items-center justify-center font-heading font-black text-xl border-2 border-[#E63946]">
                R
              </div>
              <span className="font-heading font-black text-2xl tracking-wider text-white">
                {heading}
              </span>
            </div>

            <p className="text-xs text-neutral-400 font-body leading-relaxed max-w-sm">
              {description}
            </p>

            <div className="space-y-2 text-xs text-neutral-300 font-body">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E63946]" />
                <span>House 24, Road 7, Block C, Uttara, Dhaka-1230</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#E63946]" />
                <span>Helpline: {phone} (9 AM - 10 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E63946]" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-[#E63946] border-b border-neutral-800 pb-2">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-neutral-300">
              <li>
                <button
                  onClick={() => onSelectCategory('all')}
                  className="hover:text-[#E63946] transition-colors cursor-pointer"
                >
                  All Products
                </button>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-[#E63946] transition-colors cursor-pointer text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="font-heading font-black text-xs uppercase tracking-wider text-[#E63946] border-b border-neutral-800 pb-2">
              COD Policies
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-neutral-300">
              <li>100% Cash on Delivery Policy</li>
              <li>Parcel Inspection Procedure</li>
              <li>7-Day Replacement Guarantee</li>
              <li>Dhaka & Outside Dhaka Rates</li>
              <li>Seller Onboarding</li>
            </ul>
          </div>

          {/* Guarantee Seal */}
          <div className="space-y-3 bg-neutral-900 p-4 border border-neutral-800">
            <div className="flex items-center gap-2 text-emerald-400 font-heading font-black text-xs uppercase">
              <ShieldCheck className="w-5 h-5" />
              <span>Verified Merchant</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-body">
              All orders are processed with strict privacy standards and doorstep verification.
            </p>
            <div className="pt-2 border-t border-neutral-800 text-[10px] text-neutral-500 font-mono">
              DBID Registered • Dhaka, BD
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-body gap-4">
          <p>© {new Date().getFullYear()} Rukhi E-Commerce Ltd. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Rider Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
