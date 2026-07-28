import React, { useState, useEffect } from 'react';
import { AdminUserItem, Order } from '../../types';
import { Users, Search, ShoppingBag, ShieldAlert, ShieldCheck, Eye, RefreshCw, X, MapPin, Phone, Mail, Calendar } from 'lucide-react';

interface UserDirectoryTabProps {
  userId: string;
}

export const UserDirectoryTab: React.FC<UserDirectoryTabProps> = ({ userId }) => {
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [errorMsg, setErrorMsg] = useState('');

  // User Order History Modal
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/admin/users?user_id=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch user directory');
      }
      const data = await res.json();
      setUsersList(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [userId]);

  const handleInspectUserOrders = async (user: AdminUserItem) => {
    setSelectedUser(user);
    setLoadingOrders(true);
    setUserOrders([]);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/orders?admin_user_id=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch user order history');
      }
      const data = await res.json();
      setUserOrders(data);
    } catch (err: any) {
      alert(`Error fetching order history: ${err.message}`);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.phone || '').toLowerCase().includes(query);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
        <div>
          <h2 className="font-heading font-black text-xl uppercase tracking-tight text-[#111111]">
            Customer & Account Directory
          </h2>
          <p className="text-xs text-gray-600 font-body">
            View registered user profiles, lifetime order spending, phone numbers, and inspect order histories.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="p-2 bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#E63946] hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          title="Refresh Directory"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border-2 border-red-600 text-red-900 font-body text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Search & Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F7F7F5] border-2 border-[#111111] text-xs font-body font-medium focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="bg-[#F7F7F5] border-2 border-[#111111] text-xs font-heading font-bold uppercase p-2 cursor-pointer focus:outline-none"
        >
          <option value="all">All Roles (Customers & Admins)</option>
          <option value="customer">Customers Only</option>
          <option value="admin">Admins Only</option>
        </select>
      </div>

      {/* Directory Table */}
      <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-body text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#E63946]" />
            Loading customer directory...
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body text-xs">
              <thead>
                <tr className="bg-[#111111] text-white font-heading uppercase text-[11px]">
                  <th className="p-3 border border-[#111111]">User Details</th>
                  <th className="p-3 border border-[#111111]">Phone & Address</th>
                  <th className="p-3 border border-[#111111]">Role</th>
                  <th className="p-3 border border-[#111111]">Orders Count</th>
                  <th className="p-3 border border-[#111111]">Total Spent</th>
                  <th className="p-3 border border-[#111111]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200 hover:bg-[#F7F7F5]">
                    <td className="p-3">
                      <div className="font-heading font-black text-[#111111]">
                        {u.full_name || 'Anonymous User'}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <div>{u.phone || 'N/A'}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[200px]">
                        {u.address || 'No saved address'}
                      </div>
                    </td>
                    <td className="p-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 bg-[#E63946] text-white font-heading font-black text-[10px] uppercase px-2 py-0.5 border border-[#111111] shadow-[2px_2px_0px_#111111]">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-[#111111] font-heading font-bold text-[10px] uppercase px-2 py-0.5 border border-[#111111]">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold">{u.order_count} orders</td>
                    <td className="p-3 font-heading font-bold text-[#E63946]">
                      ৳{(u.total_spent ?? 0).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleInspectUserOrders(u)}
                        className="flex items-center gap-1 bg-[#111111] text-white px-3 py-1 font-heading font-bold text-[10px] uppercase border border-[#111111] shadow-[2px_2px_0px_#E63946] hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        View Orders
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 font-body text-xs">
            No users match the search filter.
          </div>
        )}
      </div>

      {/* USER ORDER HISTORY MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#111111] shadow-[8px_8px_0px_#111111] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-start justify-between border-b-2 border-[#111111] pb-3">
              <div>
                <h3 className="font-heading font-black text-lg uppercase text-[#111111]">
                  Order History: {selectedUser.full_name || selectedUser.email}
                </h3>
                <p className="text-xs text-gray-600 font-body">
                  Lifetime Value: <strong className="text-[#E63946]">৳{(selectedUser.total_spent ?? 0).toLocaleString()}</strong> ({selectedUser.order_count} total orders)
                </p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 bg-[#111111] text-white border-2 border-[#111111] hover:bg-[#E63946] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingOrders ? (
              <div className="p-8 text-center text-gray-500 font-body text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#E63946]" />
                Loading order history...
              </div>
            ) : userOrders.length > 0 ? (
              <div className="space-y-4 font-body text-xs">
                {userOrders.map((ord) => (
                  <div key={ord.id} className="bg-[#F7F7F5] border-2 border-[#111111] p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-300 pb-2">
                      <div className="font-mono font-bold text-sm text-[#111111]">
                        Order #{ord.order_number}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-gray-500">
                          {new Date(ord.created_at || '').toLocaleDateString()}
                        </span>
                        <span className="bg-[#111111] text-white text-[10px] font-heading font-bold uppercase px-2 py-0.5 border border-[#111111]">
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-700">
                      <div>
                        <strong>Shipping Address:</strong> {ord.shipping_address}, {ord.shipping_city}
                      </div>
                      <div>
                        <strong>Contact Phone:</strong> {ord.shipping_phone}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white border border-[#111111] p-2 space-y-1">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                          <span className="font-bold text-[#111111]">{it.product_name}</span>
                          <span className="font-mono">
                            {it.quantity} x ৳{it.price.toLocaleString()} = <strong>৳{(it.quantity * it.price).toLocaleString()}</strong>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center font-heading font-black text-sm pt-1 text-[#111111]">
                      <span>Total COD Amount:</span>
                      <span className="text-[#E63946]">৳{Number(ord.total_price).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 font-body text-xs border-2 border-dashed border-gray-300">
                This user has not placed any orders yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
