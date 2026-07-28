import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Truck, Tag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: number | string, quantity: number) => void;
  onRemoveItem: (productId: number | string) => void;
  onProceedToCheckout: (discount: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cartItems,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'RUKHI100') {
      setAppliedDiscount(100);
    } else if (promoCode.trim().toUpperCase() === 'FIRSTCOD') {
      setAppliedDiscount(150);
    } else {
      setPromoError('Invalid promo code. Try RUKHI100 or FIRSTCOD');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l-2 border-[#111111] shadow-2xl flex flex-col justify-between h-full max-h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-[#111111] text-white flex items-center justify-between border-b-2 border-[#E63946]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#E63946]" />
              <h2 className="font-heading font-black text-sm uppercase tracking-wider">
                Your COD Cart ({cartItems.length})
              </h2>
            </div>
            <button onClick={onClose} className="p-1 hover:text-[#E63946] transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
                <p className="font-heading font-bold text-sm uppercase text-neutral-500">
                  Your cart is currently empty
                </p>
                <p className="text-xs text-neutral-400 font-body">
                  Add genuine items with 100% Cash on Delivery protection.
                </p>
              </div>
            ) : (
              cartItems.map((item) => {
                const imageUrl = item.product.image_url || item.product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-3 bg-[#F7F7F5] border-2 border-[#111111] p-3 shadow-[3px_3px_0px_#111111]"
                  >
                    <img
                      src={imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover border border-[#111111] flex-shrink-0"
                    />

                    <div className="flex-1 space-y-1">
                      <h4 className="font-heading font-bold text-xs uppercase line-clamp-1 text-[#111111]">
                        {item.product.name}
                      </h4>

                      <div className="font-heading font-black text-sm text-[#E63946]">
                        ৳ {item.product.price.toLocaleString()}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-[#111111] bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-heading font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-neutral-400 hover:text-[#E63946] transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-[#F7F7F5] border-t-2 border-[#111111] space-y-4">
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo Code (RUKHI100)"
                  className="flex-1 p-2 bg-white border border-[#111111] text-xs font-bold uppercase focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#111111] text-white px-3 text-xs font-heading font-bold uppercase hover:bg-[#E63946] transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {promoError && <p className="text-[10px] text-red-600 font-bold">{promoError}</p>}

              <div className="space-y-1 text-xs border-t border-neutral-300 pt-2">
                <div className="flex justify-between text-neutral-600 font-semibold">
                  <span>Subtotal:</span>
                  <span>৳ {subtotal.toLocaleString()}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Voucher:</span>
                    <span>- ৳ {appliedDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between font-heading font-black text-base text-[#111111] pt-1 border-t border-neutral-300">
                  <span>Total (Excl. Delivery):</span>
                  <span className="text-[#E63946]">৳ {Math.max(0, subtotal - appliedDiscount).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => onProceedToCheckout(appliedDiscount)}
                className="w-full bg-[#111111] text-white font-heading font-black text-sm uppercase py-4 flex items-center justify-center gap-2 shadow-[4px_4px_0px_#E63946] hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Proceed To COD Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
