import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="py-16 bg-white border-b-2 border-[#111111]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F7F7F5] border-2 border-[#111111] p-8 md:p-12 shadow-[8px_8px_0px_#111111] text-center space-y-6">
          <div className="w-12 h-12 bg-[#111111] text-white mx-auto flex items-center justify-center border-2 border-[#E63946] shadow-[3px_3px_0px_#E63946]">
            <Mail className="w-6 h-6 text-[#E63946]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#111111] uppercase tracking-tight">
              Get Exclusive COD Deals & Discounts
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-body max-w-lg mx-auto">
              Subscribe to Rukhi weekly deal updates. Receive coupon codes directly to your inbox with zero spam.
            </p>
          </div>

          {subscribed ? (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-600 text-emerald-900 font-heading font-bold text-xs uppercase flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Subscribed Successfully! Welcome to Rukhi Club.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full p-3 bg-white border-2 border-[#111111] text-xs font-semibold focus:outline-none focus:border-[#E63946]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#111111] text-white font-heading font-black text-xs uppercase px-6 py-3 shadow-[4px_4px_0px_#E63946] hover:bg-[#E63946] transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Subscribe</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
