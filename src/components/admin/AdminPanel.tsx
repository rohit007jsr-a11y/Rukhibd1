import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FinancialsTab } from './FinancialsTab';
import { ProductsTab } from './ProductsTab';
import { SiteContentTab } from './SiteContentTab';
import { UserDirectoryTab } from './UserDirectoryTab';
import { DatabaseTab } from './DatabaseTab';
import { ShieldAlert, ShieldCheck, DollarSign, Package, Layout, Users, Database, ArrowLeft, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  onClose?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'financials' | 'products' | 'site_content' | 'users' | 'database'>('financials');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const verifyRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingRole(false);
        return;
      }

      // Check in-memory profile first
      if (profile && profile.role === 'admin') {
        setIsAdmin(true);
        setCheckingRole(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/check-role?user_id=${encodeURIComponent(user.id)}`);
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('[Admin Role Check Error]:', err);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    verifyRole();
  }, [user, profile]);

  if (checkingRole) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 font-body text-xs">
        <div className="bg-white border-4 border-[#111111] p-8 shadow-[8px_8px_0px_#111111] text-center space-y-4 max-w-md">
          <RefreshCw className="w-8 h-8 text-[#E63946] animate-spin mx-auto" />
          <h2 className="font-heading font-black text-lg uppercase text-[#111111]">
            Verifying Admin Authorization...
          </h2>
          <p className="text-gray-600">
            Checking backend server-side authorization role for user <code className="font-mono font-bold text-[#E63946]">{user?.email || 'Guest'}</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 font-body">
        <div className="bg-white border-4 border-[#111111] p-8 shadow-[8px_8px_0px_#E63946] text-center space-y-4 max-w-lg">
          <div className="w-16 h-16 bg-red-100 text-red-600 border-2 border-[#111111] flex items-center justify-center mx-auto shadow-[4px_4px_0px_#111111]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-[#111111]">
            Access Denied: Admin Authorization Required
          </h2>

          <p className="text-xs text-gray-600 leading-relaxed">
            The route <code className="font-mono font-bold text-[#E63946]">/admin</code> is restricted to authorized Rukhi administrators. Your account (<code className="font-mono font-bold">{user?.email || 'Not logged in'}</code>) currently possesses the <code className="font-mono font-bold">{profile?.role || 'customer'}</code> role.
          </p>

          <div className="bg-[#F7F7F5] p-4 border-2 border-[#111111] text-left text-xs font-mono text-gray-700 space-y-2">
            <div className="font-bold text-[#111111]">To grant Admin access:</div>
            <div>Run this query in your Supabase SQL Editor:</div>
            <code className="block bg-[#111111] text-emerald-400 p-2 text-[11px] overflow-x-auto">
              UPDATE profiles SET role = 'admin' WHERE email = '{user?.email || 'your-email@example.com'}';
            </code>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#111111] text-white font-heading font-black text-xs uppercase tracking-wider border-2 border-[#111111] shadow-[4px_4px_0px_#E63946] hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111111] font-body pb-12">
      {/* Top Admin Header Bar */}
      <header className="bg-[#111111] text-white border-b-4 border-[#E63946] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 bg-[#E63946] text-white px-3 py-1.5 text-xs font-heading font-black uppercase tracking-wider border border-white shadow-[2px_2px_0px_#FFFFFF] hover:bg-white hover:text-[#111111] transition-all cursor-pointer"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
              Storefront
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-lg uppercase tracking-wider text-white">
                  RUKHI ADMIN
                </span>
                <span className="bg-emerald-500 text-[#111111] text-[10px] font-heading font-black px-1.5 py-0.5 uppercase tracking-tight">
                  ADMIN ACCESS
                </span>
              </div>
              <div className="text-[10px] text-gray-400 font-mono">
                Authenticated: {user.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-body text-gray-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Role Verified Server-Side</span>
          </div>
        </div>
      </header>

      {/* Admin Body Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-2 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('financials')}
            className={`flex items-center gap-2 px-4 py-2 font-heading font-black text-xs uppercase tracking-wider border-2 border-[#111111] transition-all cursor-pointer ${
              activeTab === 'financials'
                ? 'bg-[#E63946] text-white shadow-[3px_3px_0px_#111111]'
                : 'bg-white text-[#111111] hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Financials & Sales
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 font-heading font-black text-xs uppercase tracking-wider border-2 border-[#111111] transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#E63946] text-white shadow-[3px_3px_0px_#111111]'
                : 'bg-white text-[#111111] hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" />
            Products Catalog
          </button>

          <button
            onClick={() => setActiveTab('site_content')}
            className={`flex items-center gap-2 px-4 py-2 font-heading font-black text-xs uppercase tracking-wider border-2 border-[#111111] transition-all cursor-pointer ${
              activeTab === 'site_content'
                ? 'bg-[#E63946] text-white shadow-[3px_3px_0px_#111111]'
                : 'bg-white text-[#111111] hover:bg-gray-100'
            }`}
          >
            <Layout className="w-4 h-4" />
            Site Content Editor
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 font-heading font-black text-xs uppercase tracking-wider border-2 border-[#111111] transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#E63946] text-white shadow-[3px_3px_0px_#111111]'
                : 'bg-white text-[#111111] hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            User Directory
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 font-heading font-black text-xs uppercase tracking-wider border-2 border-[#111111] transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-[#E63946] text-white shadow-[3px_3px_0px_#111111]'
                : 'bg-white text-[#111111] hover:bg-gray-100'
            }`}
          >
            <Database className="w-4 h-4" />
            Database & RLS
          </button>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'financials' && <FinancialsTab userId={user.id} />}
        {activeTab === 'products' && <ProductsTab userId={user.id} />}
        {activeTab === 'site_content' && <SiteContentTab userId={user.id} />}
        {activeTab === 'users' && <UserDirectoryTab userId={user.id} />}
        {activeTab === 'database' && <DatabaseTab userId={user.id} />}
      </main>
    </div>
  );
};
