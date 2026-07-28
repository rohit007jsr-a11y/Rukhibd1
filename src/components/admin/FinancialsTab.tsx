import React, { useState, useEffect } from 'react';
import { FinancialMetrics, Order } from '../../types';
import { TrendingUp, DollarSign, ShoppingBag, Truck, CheckCircle2, AlertCircle, RefreshCw, Filter } from 'lucide-react';

interface FinancialsTabProps {
  userId: string;
}

export const FinancialsTab: React.FC<FinancialsTabProps> = ({ userId }) => {
  const [range, setRange] = useState<'all' | '7d' | '30d' | 'month'>('all');
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadFinancials = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/admin/financials?user_id=${encodeURIComponent(userId)}&range=${range}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to load financial reporting metrics.');
      }
      const data = await res.json();
      setMetrics({
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        avgOrderValue: data.avgOrderValue || 0,
        statusBreakdown: data.statusBreakdown || { processing: 0, outForDelivery: 0, delivered: 0, cancelled: 0 },
        dailyRevenue: data.dailyRevenue || [],
      });
      setRecentOrders(data.recentOrders || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, [range, userId]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update order status');
      }
      setRecentOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
        <div>
          <h2 className="font-heading font-black text-xl uppercase tracking-tight text-[#111111]">
            Financial & Sales Analytics
          </h2>
          <p className="text-xs text-gray-600 font-body">
            Real-time revenue metrics, average order values, and fulfillment status for Rukhi COD orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#F7F7F5] border-2 border-[#111111] p-1 text-xs font-heading font-bold">
            <Filter className="w-3.5 h-3.5 ml-1 text-[#E63946]" />
            {(['all', '7d', '30d', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 uppercase tracking-wider cursor-pointer transition-all ${
                  range === r
                    ? 'bg-[#E63946] text-white shadow-[2px_2px_0px_#111111]'
                    : 'text-[#111111] hover:bg-gray-200'
                }`}
              >
                {r === 'all' ? 'All Time' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'This Month'}
              </button>
            ))}
          </div>

          <button
            onClick={loadFinancials}
            className="p-2 bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#E63946] hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            title="Refresh Financial Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border-2 border-red-600 text-red-900 font-body text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#E63946] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-gray-600">
              Total Revenue
            </span>
            <div className="p-2 bg-[#E63946] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-black text-3xl text-[#111111]">
            ৳{metrics?.totalRevenue.toLocaleString() || '0'}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Sum of all completed & active COD orders</div>
        </div>

        <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-gray-600">
              Total Orders
            </span>
            <div className="p-2 bg-[#111111] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#E63946]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-black text-3xl text-[#111111]">
            {metrics?.totalOrders || 0}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Placed across 64 Bangladesh districts</div>
        </div>

        <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-gray-600">
              Average Order Value
            </span>
            <div className="p-2 bg-[#F0EDEA] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <TrendingUp className="w-4 h-4 text-[#E63946]" />
            </div>
          </div>
          <div className="font-heading font-black text-3xl text-[#111111]">
            ৳{Math.round(metrics?.avgOrderValue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Average cart size per customer</div>
        </div>

        <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-gray-600">
              Delivered Rate
            </span>
            <div className="p-2 bg-emerald-600 text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-black text-3xl text-emerald-700">
            {metrics?.totalOrders
              ? Math.round(((metrics.statusBreakdown.delivered || 0) / metrics.totalOrders) * 100)
              : 0}%
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {metrics?.statusBreakdown.delivered || 0} Delivered / {metrics?.statusBreakdown.processing || 0} Processing
          </div>
        </div>
      </div>

      {/* Revenue Timeline Table / Visual */}
      <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
        <h3 className="font-heading font-black text-lg uppercase tracking-tight text-[#111111] mb-4">
          Daily Revenue Timeline
        </h3>

        {metrics?.dailyRevenue && metrics.dailyRevenue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body text-xs">
              <thead>
                <tr className="bg-[#111111] text-white font-heading uppercase text-[11px]">
                  <th className="p-3 border border-[#111111]">Date</th>
                  <th className="p-3 border border-[#111111]">Orders Count</th>
                  <th className="p-3 border border-[#111111]">Revenue (BDT)</th>
                  <th className="p-3 border border-[#111111]">Share</th>
                </tr>
              </thead>
              <tbody>
                {metrics.dailyRevenue.map((d) => {
                  const maxRev = Math.max(...metrics.dailyRevenue.map((item) => item.revenue), 1);
                  const pct = Math.round((d.revenue / maxRev) * 100);
                  return (
                    <tr key={d.date} className="border-b border-gray-200 hover:bg-[#F7F7F5]">
                      <td className="p-3 font-mono font-bold text-[#111111]">{d.date}</td>
                      <td className="p-3 font-bold">{d.ordersCount} orders</td>
                      <td className="p-3 font-heading font-bold text-[#E63946]">
                        ৳{d.revenue.toLocaleString()}
                      </td>
                      <td className="p-3 w-48">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 h-3 border border-[#111111]">
                            <div
                              className="bg-[#E63946] h-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[10px] text-gray-600">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 font-body text-xs border-2 border-dashed border-gray-300">
            No order transactions recorded for the selected time window. Place an order on the storefront to test live analytics.
          </div>
        )}
      </div>

      {/* Recent Orders with Quick Status Selector */}
      <div className="bg-white p-5 border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-black text-lg uppercase tracking-tight text-[#111111]">
            Recent Marketplace Orders
          </h3>
          <span className="text-xs font-body font-bold text-[#E63946]">
            Showing latest {recentOrders.length} orders
          </span>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body text-xs">
              <thead>
                <tr className="bg-[#111111] text-white font-heading uppercase text-[11px]">
                  <th className="p-3 border border-[#111111]">Order #</th>
                  <th className="p-3 border border-[#111111]">Customer</th>
                  <th className="p-3 border border-[#111111]">Phone & Location</th>
                  <th className="p-3 border border-[#111111]">Amount</th>
                  <th className="p-3 border border-[#111111]">Order Status</th>
                  <th className="p-3 border border-[#111111]">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="border-b border-gray-200 hover:bg-[#F7F7F5]">
                    <td className="p-3 font-mono font-bold text-[#111111]">{ord.order_number}</td>
                    <td className="p-3 font-bold">
                      {ord.shipping_name}
                      <div className="text-[10px] font-normal text-gray-500">
                        {ord.guest_email || 'Registered User'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>{ord.shipping_phone}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[200px]">
                        {ord.shipping_city} - {ord.shipping_address}
                      </div>
                    </td>
                    <td className="p-3 font-heading font-bold text-[#111111]">
                      ৳{Number(ord.total_price).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider border border-[#111111] ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Out for Delivery'
                            ? 'bg-amber-100 text-amber-900'
                            : ord.status === 'Cancelled'
                            ? 'bg-red-100 text-red-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        disabled={updatingOrderId === ord.id}
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className="bg-white border-2 border-[#111111] text-xs px-2 py-1 font-body font-bold cursor-pointer hover:bg-gray-50 shadow-[2px_2px_0px_#111111]"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 font-body text-xs border-2 border-dashed border-gray-300">
            No recent orders found.
          </div>
        )}
      </div>
    </div>
  );
};
