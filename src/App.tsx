import React, { useState, useEffect } from 'react';
import { Product, CartItem } from './types';
import { useScrollReveal } from './hooks/useScrollReveal';
import { useAuth } from './context/AuthContext';
import { getUserRole } from './utils/api';

import { TopBanner } from './components/TopBanner';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { FeaturedProducts } from './components/FeaturedProducts';
import { WhyRukhi } from './components/WhyRukhi';
import { AboutRukhi } from './components/AboutRukhi';
import { NewArrivals } from './components/NewArrivals';
import { CodTrustBanner } from './components/CodTrustBanner';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';

import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminPanel } from './components/admin/AdminPanel';

export default function App() {
  useScrollReveal();
  const { user, signOut } = useAuth();

  // State
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin';
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminView(window.location.pathname === '/admin' || window.location.hash === '#admin');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const verifyAndRedirectRole = async () => {
      const currentPath = window.location.pathname;
      if (user) {
        if (user.email === 'rohitkumarrohitjsr@gmail.com') {
          if (currentPath !== '/admin') {
            window.history.pushState({}, '', '/admin');
            setIsAdminView(true);
          }
          return;
        }
        const role = await getUserRole(user.id, user.email);
        if (role === 'admin') {
          if (currentPath !== '/admin') {
            window.history.pushState({}, '', '/admin');
            setIsAdminView(true);
          }
        } else {
          if (currentPath === '/admin') {
            window.history.pushState({}, '', '/');
            setIsAdminView(false);
          }
        }
      } else {
        if (currentPath === '/admin') {
          window.history.pushState({}, '', '/');
          setIsAdminView(false);
        }
      }
    };
    verifyAndRedirectRole();
  }, [user]);

  const handleOpenAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminView(true);
  };

  const handleCloseAdmin = () => {
    window.history.pushState({}, '', '/');
    setIsAdminView(false);
  };

  // Modals & Drawers
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantity: number = 1,
    size?: string,
    color?: string
  ) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, selectedSize: size, selectedColor: color }];
    });
    setCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: number | string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const handleRemoveFromCart = (productId: number | string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleMoveToCart = (product: Product) => {
    handleAddToCart(product, 1);
    setWishlist((prev) => prev.filter((p) => p.id !== product.id));
  };

  const handleOpenAccount = () => {
    if (user) {
      setProfileOpen(true);
    } else {
      setAuthOpen(true);
    }
  };

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    setTimeout(() => {
      const el = document.getElementById('shop');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  if (isAdminView) {
    return <AdminPanel onClose={handleCloseAdmin} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111111] font-body selection:bg-[#E63946] selection:text-white flex flex-col justify-between overflow-x-hidden w-full max-w-full">
      <div>
        <TopBanner />
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
          onOpenCart={() => setCartOpen(true)}
          onOpenWishlist={() => setWishlistOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onSelectCategory={handleSelectCategory}
          onOpenAuth={handleOpenAccount}
        />

        <main className="w-full overflow-x-hidden">
          <Hero
            onShopClick={() => {
              const el = document.getElementById('shop');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onExploreCategoriesClick={() => {
              const el = document.getElementById('categories');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <CategoryGrid onSelectCategory={handleSelectCategory} />

          <FeaturedProducts
            activeCategory={activeCategory}
            wishlistIds={wishlist.map((p) => p.id)}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={(p) => setQuickViewProduct(p)}
            onSelectCategory={handleSelectCategory}
          />

          <NewArrivals
            onExploreClick={() => {
              handleSelectCategory('all');
            }}
          />

          <WhyRukhi />

          <CodTrustBanner />

          <AboutRukhi />

          <Newsletter />
        </main>
      </div>

      <Footer onSelectCategory={handleSelectCategory} />

      {/* Modals & Drawers */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={cartOpen}
        cartItems={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={(discount) => {
          setAppliedDiscount(discount);
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <WishlistDrawer
        isOpen={wishlistOpen}
        wishlistProducts={wishlist}
        onClose={() => setWishlistOpen(false)}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={handleMoveToCart}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        onSelectCategory={(catId) => setActiveCategory(catId)}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        cartItems={cart}
        discount={appliedDiscount}
        user={user}
        onClose={() => setCheckoutOpen(false)}
        onOrderComplete={() => setCart([])}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => setAuthOpen(false)}
      />

      <UserProfileModal
        isOpen={profileOpen}
        user={user}
        onClose={() => setProfileOpen(false)}
        onSignOut={() => {
          signOut();
          setProfileOpen(false);
        }}
      />
    </div>
  );
}
