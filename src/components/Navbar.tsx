import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  PackageCheck,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onSelectCategory: (catId: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onSelectCategory,
  onOpenAuth,
}) => {
  const { user, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-[#111111] w-full max-w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1.5 sm:gap-4">
          {/* Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-[#111111] hover:bg-[#F0EDEA] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            {/* Brand Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory('all');
                const el = document.getElementById('shop');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group flex items-center gap-1.5"
            >
              <div className="bg-[#111111] text-white px-2 py-1 sm:px-3 sm:py-1.5 font-heading font-black text-lg sm:text-2xl uppercase tracking-tighter border-2 border-[#111111] shadow-[2px_2px_0px_#E63946] sm:shadow-[4px_4px_0px_#E63946] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all">
                RUKHI
              </div>
              <span className="hidden xs:inline-block bg-[#E63946] text-white font-heading font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 uppercase tracking-wider">
                COD
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => {
                onSelectCategory('all');
                const el = document.getElementById('shop');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-heading font-bold text-xs uppercase tracking-wider text-[#111111] hover:text-[#E63946] transition-colors cursor-pointer"
            >
              All Marketplace
            </button>

            {/* Mega Menu Trigger */}
            <div
              className="relative py-6"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                onClick={() => {
                  const el = document.getElementById('categories');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1 font-heading font-bold text-xs uppercase tracking-wider text-[#111111] hover:text-[#E63946] transition-colors cursor-pointer"
              >
                <span>Shop Categories</span>
                <ChevronDown className="w-4 h-4 text-[#E63946]" />
              </button>

              {/* Mega Dropdown */}
              {megaMenuOpen && (
                <div className="absolute top-full left-0 w-[640px] bg-white border-2 border-[#111111] shadow-[8px_8px_0px_#111111] p-6 grid grid-cols-2 gap-6 z-50 animate-in fade-in duration-150">
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setMegaMenuOpen(false);
                        const el = document.getElementById('shop');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group p-3 border border-gray-200 hover:border-[#111111] hover:bg-[#F7F7F5] transition-all cursor-pointer flex gap-3 items-center"
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-14 h-14 object-cover border border-[#111111] shadow-[2px_2px_0px_#111111]"
                      />
                      <div>
                        <h4 className="font-heading font-black text-xs uppercase text-[#111111] group-hover:text-[#E63946] transition-colors">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-body mt-0.5">
                          {cat.itemCount}+ Items • COD Available
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('why-rukhi');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-heading font-bold text-xs uppercase tracking-wider text-[#111111] hover:text-[#E63946] transition-colors cursor-pointer"
            >
              Why Trust Us?
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('about');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-heading font-bold text-xs uppercase tracking-wider text-[#111111] hover:text-[#E63946] transition-colors cursor-pointer"
            >
              Our Story
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2 text-[#111111] hover:bg-[#F0EDEA] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] sm:shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
              title="Search products"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#E63946]" />
              <span className="hidden md:inline font-heading font-bold text-xs uppercase">Search</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-1.5 sm:p-2 text-[#111111] hover:bg-[#F0EDEA] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] sm:shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#E63946] text-white font-heading font-black text-[9px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border border-[#111111]">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-1.5 sm:p-2 bg-[#111111] text-white hover:bg-[#E63946] border-2 border-[#111111] shadow-[2px_2px_0px_#E63946] sm:shadow-[4px_4px_0px_#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
              title="Open Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden md:inline font-heading font-black text-xs uppercase">Cart</span>
              <span className="bg-[#E63946] text-white font-heading font-black text-[10px] sm:text-xs px-1 py-0.5 border border-white">
                {cartCount}
              </span>
            </button>

            {/* User Account / Auth */}
            <button
              onClick={onOpenAuth}
              className="p-1.5 sm:p-2 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] sm:shadow-[3px_3px_0px_#111111] hover:bg-[#F0EDEA] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
              title="Account"
            >
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#111111]" />
              <span className="hidden xl:inline font-heading font-bold text-xs uppercase text-[#111111]">
                {user ? user.full_name?.split(' ')[0] || 'Account' : 'Sign In'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-[#111111] bg-white p-4 space-y-5 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-2">
            <h3 className="font-heading font-black text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1">
              Quick Navigation
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectCategory('all');
                  setMobileMenuOpen(false);
                  const el = document.getElementById('shop');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-left font-heading font-black text-xs uppercase py-2 px-3 bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#E63946]"
              >
                All Products
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('why-rukhi');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-left font-heading font-bold text-xs uppercase py-2 px-3 bg-[#F7F7F5] border-2 border-[#111111]"
              >
                Why Trust Us?
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-black text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1">
              Browse Categories
            </h3>
            <div className="grid grid-cols-1 gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCategory(c.id);
                    setMobileMenuOpen(false);
                    const el = document.getElementById('shop');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-left font-heading font-bold text-xs uppercase py-2 px-3 hover:bg-[#F0EDEA] bg-[#F7F7F5] border border-gray-300 flex items-center justify-between cursor-pointer"
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-[#E63946] bg-red-50 px-1.5 font-mono border border-red-200">
                    {c.itemCount} items
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
