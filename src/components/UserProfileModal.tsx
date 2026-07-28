import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  LogOut,
  Package,
  RefreshCw,
} from 'lucide-react';
import { fetchUserOrders } from '../utils/api';
import { User, Order } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSignOut: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setLoadingOrders(true);
      fetchUserOrders(user.id, user.email)
        .then((data) => {
          setOrders(data);
          setLoadingOrders(false);
        })
        .catch(() => setLoadingOrders(false));
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl border-2 border-[#111111] shadow-[8px_8px_0px_#111111] relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#111111] text-white p-4 flex items-center justify-between border-b-2 border-[#111111]">
          <div className="flex items-center gap-2">
            <span className="bg-[#E63946] text-white font-heading font-black text-xs uppercase px-2 py-0.5 tracking-wider">
              MY DASHBOARD
            </span>
            <span className="text-xs text-gray-300 font-body">
              Verified Rukhi Customer
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-[#111111] bg-[#F7F7F5]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 text-xs font-heading font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white border-b-4 border-[#E63946] text-[#111111]'
                : 'text-gray-600 hover:text-[#E63946]'
            }`}
          >
            <Package className="w-4 h-4 text-[#E63946]" />
            <span>Order History ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-xs font-heading font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white border-b-4 border-[#E63946] text-[#111111]'
                : 'text-gray-600 hover:text-[#E63946]'
            }`}
          >
            <UserIcon className="w-4 h-4 text-[#E63946]" />
            <span>Account Profile</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'orders' && (
            <div>
              {loadingOrders ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-[#E63946] animate-spin mx-auto" />
                  <p className="text-xs font-heading font-bold uppercase text-gray-600">
                    Fetching orders from database...
                  </p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-[#F7F7F5] border-2 border-dashed border-[#111111] p-6">
                  <Package className="w-10 h-10 text-gray-400 mx-auto" />
                  <h3 className="font-heading font-black text-sm uppercase text-[#111111]">
                    No Orders Placed Yet
                  </h3>
                  <p className="text-xs text-gray-600 max-w-xs mx-auto">
                    Browse our multi-category Bangladesh marketplace and order with 100% Cash-on-Delivery.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-[#F7F7F5] border-2 border-[#111111] p-4 shadow-[4px_4px_0px_#111111] space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-gray-300 text-xs">
                        <div>
                          <span className="font-heading font-black text-sm text-[#111111]">
                            {ord.order_number}
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="bg-[#111111] text-white text-[10px] font-heading font-bold uppercase px-2 py-0.5 shadow-[2px_2px_0px_#E63946]">
                            {ord.status}
                          </span>
                          <span className="text-xs font-heading font-black text-[#E63946] block mt-1">
                            ৳ {Number(ord.total_price).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      {ord.items && ord.items.length > 0 && (
                        <div className="space-y-2">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white p-2 border border-gray-200">
                              {item.image_url && (
                                <img
                                  src={item.image_url}
                                  alt={item.product_name}
                                  className="w-10 h-10 object-cover border border-gray-300"
                                />
                              )}
                              <div className="flex-1 text-xs">
                                <span className="font-bold text-[#111111] block line-clamp-1">
                                  {item.product_name}
                                </span>
                                <span className="text-gray-500">
                                  Qty: {item.quantity} × ৳ {Number(item.price).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-600 flex items-center justify-between">
                        <span>Delivery to: {ord.shipping_address}</span>
                        <span className="font-bold text-[#111111]">{ord.payment_method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* User Avatar Card */}
              <div className="bg-[#F7F7F5] border-2 border-[#111111] p-5 shadow-[4px_4px_0px_#111111] flex items-center gap-4">
                <div className="w-14 h-14 bg-[#111111] text-white font-heading font-black text-xl flex items-center justify-center border-2 border-[#E63946] shadow-[2px_2px_0px_#E63946]">
                  {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-black text-lg text-[#111111] uppercase tracking-tight">
                    {user.full_name || 'Rukhi Customer'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-body">
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    <span>{user.email}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold font-heading uppercase border border-green-300 mt-1">
                    <ShieldCheck className="w-3 h-3 text-green-600" />
                    <span>COD Priority Member</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-[#F7F7F5] border-2 border-[#111111] p-4 shadow-[4px_4px_0px_#111111]">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block">Name:</span>
                    <strong className="text-[#111111] font-bold text-sm">
                      {user.full_name || 'Not set'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block">Phone:</span>
                    <strong className="text-[#111111] font-bold text-sm">
                      {user.phone || 'Not set'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block">Payment Method:</span>
                    <strong className="text-[#111111] font-bold text-sm">
                      100% Cash on Delivery
                    </strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block">Coverage:</span>
                    <strong className="text-[#111111] font-bold text-sm">
                      All 64 Districts BD
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                className="w-full bg-[#FEF2F2] border-2 border-[#E63946] text-[#E63946] hover:bg-[#E63946] hover:text-white font-heading font-bold text-xs uppercase py-3 px-4 shadow-[4px_4px_0px_#E63946] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
