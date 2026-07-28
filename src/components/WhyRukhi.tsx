import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Headphones, CheckCircle2 } from 'lucide-react';

export const WhyRukhi: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#E63946]" />,
      title: '0 Advance Payment',
      desc: 'Pay zero taka in advance. Pay only when the delivery rider hands over your parcel.',
    },
    {
      icon: <Truck className="w-8 h-8 text-[#E63946]" />,
      title: 'Nationwide Delivery',
      desc: 'Express delivery covering all 64 districts & police stations across Bangladesh.',
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-[#E63946]" />,
      title: 'On-Spot Inspection',
      desc: 'Inspect parcel contents in front of the delivery agent before completing payment.',
    },
    {
      icon: <Headphones className="w-8 h-8 text-[#E63946]" />,
      title: '7 Days Replacement',
      desc: 'Hassle-free 7-day replacement guarantee if there are any factory defects.',
    },
  ];

  return (
    <section id="why-rukhi" className="py-16 bg-white border-b-2 border-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1 text-xs font-heading font-black text-[#E63946] uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" />
            <span>Why Millions Trust Rukhi</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#111111] uppercase tracking-tight">
            The COD E-Commerce Promise
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-body">
            Built specifically for shoppers in Bangladesh who value trust, transparency, and product verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="p-6 bg-[#F7F7F5] border-2 border-[#111111] shadow-[6px_6px_0px_#111111] hover:shadow-[2px_2px_0px_#E63946] transition-all space-y-3"
            >
              <div className="w-14 h-14 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="font-heading font-black text-lg text-[#111111] uppercase">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-600 font-body leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
