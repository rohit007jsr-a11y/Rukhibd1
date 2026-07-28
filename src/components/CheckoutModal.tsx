import React, { useState } from 'react';
import { CartItem, User } from '../types';
import { BANGLADESH_DIVISIONS, DHAKA_POLICE_STATIONS } from '../data/mockData';
import { X, ShieldCheck, Truck, CheckCircle2, MapPin, User as UserIcon, ArrowRight, Package, RefreshCw } from 'lucide-react';
import { createOrder } from '../utils/api';

interface CheckoutModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  discount: number;
  user: User | null;
  onClose: () => void;
  onOrderComplete: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cartItems,
  discount,
  user,
  onClose,
  onOrderComplete,
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka City - North');
  const [policeStation, setPoliceStation] = useState('Uttara');
  const [address, setAddress] = useState(user?.address || '');
  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharge = deliveryArea === 'inside_dhaka' ? 60 : 120;
  const totalAmount = Math.max(0, subtotal - discount + deliveryCharge);

  const handleDivisionChange = (div: string) => {
    const districts = BANGLADESH_DIVISIONS[div] || [];
    setDivision(div);
    setDistrict(districts[0] || '');
    setDeliveryArea(div === 'Dhaka' && districts[0]?.includes('Dhaka City') ? 'inside_dhaka' : 'outside_dhaka');
  };

  const handleDistrictChange = (dist: string) => {
    setDistrict(dist);
    setDeliveryArea(dist.includes('Dhaka City') ? 'inside_dhaka' : 'outside_dhaka');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter recipient full name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 11) {
      setFormError('Please enter a valid 11-digit Bangladesh phone number (e.g. 01712345678).');
      return;
    }

    if (!address.trim()) {
      setFormError('Please enter full delivery address (House, Road, Block).');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        user_id: user?.id,
        guest_email: user?.email || email,
        shipping_name: fullName,
        shipping_phone: phone,
        shipping_address: `${address}, ${policeStation}, ${district}, ${division}`,
        shipping_city: district,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image_url: item.product.image_url || (item.product as any).image,
        })),
        subtotal: subtotal - discount,
        delivery_fee: deliveryCharge,
      };

      const res = await createOrder(orderPayload);
      setLoading(false);
      setConfirmedOrder(res.order);
    } catch (err: any) {
      setLoading(false);
      setFormError(err.message || 'Failed to place order.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border-2 border-[#111111] shadow-[8px_8px_0px_#111111] my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 bg-[#111111] text-white flex items-center justify-between border-b-2 border-[#E63946] sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-[#E63946]" />
            <div>
              <h2 className="font-heading font-black text-xl uppercase tracking-wider">
                {confirmedOrder ? 'Order Confirmed!' : 'Cash on Delivery Checkout'}
              </h2>
              <p className="text-xs text-neutral-400 font-body">
                {confirmedOrder ? 'Saved to Rukhi Database' : 'Pay when you inspect your parcel at doorstep'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:text-[#E63946] transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {confirmedOrder ? (
          /* Success Screen */
          <div className="p-6 md:p-8 space-y-6">
            <div className="p-6 bg-emerald-50 border-2 border-emerald-600 text-emerald-900 flex items-start gap-4 shadow-[4px_4px_0px_#111111]">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading font-black text-xl uppercase tracking-tight text-emerald-950">
                  Order Placed Successfully!
                </h3>
                <p className="text-sm font-medium text-emerald-800 mt-1">
                  Order Number: <span className="font-bold underline">{confirmedOrder.order_number}</span>
                </p>
                <p className="text-xs text-emerald-700 mt-2">
                  Our delivery agent will call <span className="font-bold">{phone}</span> prior to delivery.
                </p>
              </div>
            </div>

            {/* Summary Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F7F7F5] p-6 border-2 border-[#111111]">
              <div>
                <h4 className="font-heading font-bold text-xs uppercase text-neutral-500 mb-3 border-b border-neutral-300 pb-1">
                  Delivery Address
                </h4>
                <div className="text-xs font-semibold text-[#111111] space-y-1">
                  <p className="font-bold text-sm">{fullName}</p>
                  <p>Phone: {phone}</p>
                  <p>{address}</p>
                  <p>{policeStation}, {district}, {division}</p>
                </div>
              </div>

              <div>
                <h4 className="font-heading font-bold text-xs uppercase text-neutral-500 mb-3 border-b border-neutral-300 pb-1">
                  Payment Breakdown (COD)
                </h4>
                <div className="text-xs text-neutral-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold">৳ {(subtotal - discount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className="font-bold">৳ {deliveryCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-heading font-black text-base text-[#111111] pt-2 border-t border-neutral-300">
                    <span>Pay Cash on Delivery:</span>
                    <span className="text-[#E63946]">৳ {confirmedOrder.total_price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onOrderComplete();
                onClose();
              }}
              className="w-full bg-[#111111] text-white font-heading font-black text-sm uppercase py-4 flex items-center justify-center gap-2 shadow-[6px_6px_0px_#E63946] hover:bg-[#E63946] transition-colors cursor-pointer"
            >
              <span>Return to Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 md:p-8 space-y-6">
            {formError && (
              <div className="p-3 bg-red-50 border-2 border-[#E63946] text-[#E63946] text-xs font-bold">
                {formError}
              </div>
            )}

            {/* Recipient Information */}
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#111111] pb-2 border-b-2 border-[#111111] flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#E63946]" />
                <span>1. Receiver Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-heading font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full p-2.5 bg-[#F7F7F5] border border-neutral-300 text-xs font-semibold focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Mobile Phone Number (COD Call) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full p-2.5 bg-[#F7F7F5] border border-neutral-300 text-xs font-semibold focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#111111] pb-2 border-b-2 border-[#111111] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E63946]" />
                <span>2. Delivery Address in Bangladesh</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-heading font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Division *
                  </label>
                  <select
                    value={division}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F7F5] border border-neutral-300 text-xs font-bold text-[#111111] focus:outline-none cursor-pointer"
                  >
                    {Object.keys(BANGLADESH_DIVISIONS).map((div) => (
                      <option key={div} value={div}>
                        {div} Division
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold text-[#111111] uppercase tracking-wider mb-1">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F7F5] border border-neutral-300 text-xs font-bold text-[#111111] focus:outline-none cursor-pointer"
                  >
                    {(BANGLADESH_DIVISIONS[division] || []).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Thana / Police Station *
                  </label>
                  {division === 'Dhaka' ? (
                    <select
                      value={policeStation}
                      onChange={(e) => setPoliceStation(e.target.value)}
                      className="w-full p-2.5 bg-[#F7F7F5] border border-neutral-300 text-xs font-bold text-[#111111] focus:outline-none cursor-pointer"
                    >
                      {DHAKA_POLICE_STATIONS.map((thana) => (
                        <option key={thana} value={thana}>
                          {thana}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={policeStation}
                      onChange={(e) => setPoliceStation(e.target.value)}
                      placeholder="e.g. Kotwali / Sadar"
                      className="w-full p-2.5 bg-[#F7F7F5] border border-neutral-300 text-xs font-semibold focus:outline-none focus:border-[#111111]"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Street Address (House, Road, Flat, Area) *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 24, Road 7, Sector 3, Uttara"
                  className="w-full p-2.5 bg-[#F7F7F5] border border-neutral-300 text-xs font-semibold focus:outline-none focus:border-[#111111]"
                />
              </div>

              {/* Delivery Zone Radio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label
                  className={`p-3 border-2 flex items-center justify-between cursor-pointer transition-all ${
                    deliveryArea === 'inside_dhaka'
                      ? 'border-[#E63946] bg-[#E63946]/5 shadow-[3px_3px_0px_#111111]'
                      : 'border-neutral-200 bg-[#F7F7F5]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryArea"
                      checked={deliveryArea === 'inside_dhaka'}
                      onChange={() => setDeliveryArea('inside_dhaka')}
                      className="accent-[#E63946]"
                    />
                    <div>
                      <div className="font-bold text-xs text-[#111111]">Inside Dhaka City</div>
                      <div className="text-[10px] text-neutral-500">Express 24-48 Hours</div>
                    </div>
                  </div>
                  <span className="font-heading font-black text-xs text-[#E63946]">৳ 60</span>
                </label>

                <label
                  className={`p-3 border-2 flex items-center justify-between cursor-pointer transition-all ${
                    deliveryArea === 'outside_dhaka'
                      ? 'border-[#E63946] bg-[#E63946]/5 shadow-[3px_3px_0px_#111111]'
                      : 'border-neutral-200 bg-[#F7F7F5]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryArea"
                      checked={deliveryArea === 'outside_dhaka'}
                      onChange={() => setDeliveryArea('outside_dhaka')}
                      className="accent-[#E63946]"
                    />
                    <div>
                      <div className="font-bold text-xs text-[#111111]">Outside Dhaka (All Districts)</div>
                      <div className="text-[10px] text-neutral-500">Delivery in 2-4 Days</div>
                    </div>
                  </div>
                  <span className="font-heading font-black text-xs text-[#E63946]">৳ 120</span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#111111] pb-2 border-b-2 border-[#111111] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E63946]" />
                <span>3. Payment Method</span>
              </h3>

              <div className="p-4 bg-[#111111] text-white border-2 border-[#111111] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E63946] flex items-center justify-center text-white">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-heading font-black text-sm uppercase tracking-wider">
                      Cash on Delivery (COD)
                    </div>
                    <div className="text-xs text-neutral-300 font-body">
                      0 Advance Payment. Check parcel before paying.
                    </div>
                  </div>
                </div>
                <span className="bg-[#E63946] text-white font-bold text-[10px] px-2 py-0.5 uppercase tracking-wider">
                  Guaranteed
                </span>
              </div>
            </div>

            {/* Final Summary Box */}
            <div className="p-4 bg-[#F7F7F5] border border-neutral-300 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600 font-semibold">
                <span>Items Subtotal ({cartItems.length}):</span>
                <span>৳ {(subtotal - discount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600 font-semibold">
                <span>Delivery Charge:</span>
                <span>৳ {deliveryCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-heading font-black text-lg text-[#111111] pt-2 border-t border-neutral-300">
                <span>Total Payable Cash:</span>
                <span className="text-[#E63946]">৳ {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111111] text-white font-heading font-black text-base uppercase tracking-wider py-4 flex items-center justify-center gap-3 shadow-[6px_6px_0px_#E63946] hover:bg-[#E63946] hover:shadow-[2px_2px_0px_#111111] active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Saving Order...</span>
                </>
              ) : (
                <>
                  <span>Confirm Order (Pay ৳{totalAmount.toLocaleString()} Cash)</span>
                  <Truck className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
