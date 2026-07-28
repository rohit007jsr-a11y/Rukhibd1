import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { Search, Plus, Edit3, Trash2, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Eye, Image as ImageIcon } from 'lucide-react';

interface ProductsTabProps {
  userId: string;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({ userId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'electronics',
    subCategory: '',
    price: '',
    originalPrice: '',
    imageUrl: '',
    description: '',
    stock: '20',
    stockStatus: 'in_stock',
    tag: '',
    isBestseller: false,
    isTrending: false,
    isNew: false,
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/admin/products?user_id=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to load admin products list');
      }
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [userId]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'electronics',
      subCategory: '',
      price: '',
      originalPrice: '',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
      description: '',
      stock: '20',
      stockStatus: 'in_stock',
      tag: 'New Item',
      isBestseller: false,
      isTrending: false,
      isNew: true,
      isActive: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category || 'electronics',
      subCategory: prod.subCategory || '',
      price: String(prod.price),
      originalPrice: prod.originalPrice ? String(prod.originalPrice) : '',
      imageUrl: prod.image_url || prod.image || '',
      description: prod.description || '',
      stock: String(prod.stock ?? 20),
      stockStatus: prod.stockStatus || 'in_stock',
      tag: prod.tag || '',
      isBestseller: !!prod.isBestseller,
      isTrending: !!prod.isTrending,
      isNew: !!prod.isNew,
      isActive: prod.is_active !== false,
    });
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.imageUrl) {
      alert('Product Name, Price, and Image URL are required!');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        name: formData.name,
        category: formData.category,
        sub_category: formData.subCategory,
        price: Number(formData.price),
        original_price: formData.originalPrice ? Number(formData.originalPrice) : null,
        image_url: formData.imageUrl,
        description: formData.description,
        stock: Number(formData.stock) || 10,
        stock_status: formData.stockStatus,
        tag: formData.tag,
        is_bestseller: formData.isBestseller,
        is_trending: formData.isTrending,
        is_new: formData.isNew,
        is_active: formData.isActive,
      };

      let url = '/api/admin/products';
      let method = 'POST';

      if (editingProduct) {
        url = `/api/admin/products/${editingProduct.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Save failed');
      }

      setIsFormOpen(false);
      loadProducts();
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSoftDelete = async () => {
    if (!deletingProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${deletingProduct.id}?user_id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Soft delete failed');
      }
      setDeletingProduct(null);
      loadProducts();
    } catch (err: any) {
      alert(`Error deactivating product: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Filtered List
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.is_active !== false) ||
      (statusFilter === 'inactive' && p.is_active === false);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
        <div>
          <h2 className="font-heading font-black text-xl uppercase tracking-tight text-[#111111]">
            Product Catalog Management
          </h2>
          <p className="text-xs text-gray-600 font-body">
            Add, update inventory, toggle bestseller tags, and soft-delete products without breaking historic order logs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#E63946] text-white px-4 py-2 font-heading font-black text-xs uppercase tracking-wider border-2 border-[#111111] shadow-[4px_4px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border-2 border-red-600 text-red-900 font-body text-xs">
          {errorMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F7F7F5] border-2 border-[#111111] text-xs font-body font-medium focus:outline-none focus:bg-white"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#F7F7F5] border-2 border-[#111111] text-xs font-heading font-bold uppercase p-2 cursor-pointer focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="fashion">Fashion</option>
          <option value="home">Home & Living</option>
          <option value="groceries">Groceries & Organic</option>
        </select>

        {/* Active/Inactive Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-[#F7F7F5] border-2 border-[#111111] text-xs font-heading font-bold uppercase p-2 cursor-pointer focus:outline-none"
        >
          <option value="all">All Statuses (Active & Soft-Deleted)</option>
          <option value="active">Active Products Only</option>
          <option value="inactive">Soft-Deleted / Inactive Only</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-body text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#E63946]" />
            Loading catalog data...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body text-xs">
              <thead>
                <tr className="bg-[#111111] text-white font-heading uppercase text-[11px]">
                  <th className="p-3 border border-[#111111]">Image</th>
                  <th className="p-3 border border-[#111111]">Product Name</th>
                  <th className="p-3 border border-[#111111]">Category</th>
                  <th className="p-3 border border-[#111111]">Price</th>
                  <th className="p-3 border border-[#111111]">Stock</th>
                  <th className="p-3 border border-[#111111]">Status</th>
                  <th className="p-3 border border-[#111111]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className={`border-b border-gray-200 hover:bg-[#F7F7F5] ${p.is_active === false ? 'bg-gray-50 opacity-75' : ''}`}>
                    <td className="p-3 w-16">
                      <img
                        src={p.image_url || p.image}
                        alt={p.name}
                        className="w-12 h-12 object-cover border border-[#111111]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                    </td>
                    <td className="p-3 font-bold text-[#111111]">
                      {p.name}
                      {p.isBestseller && (
                        <span className="ml-2 px-1.5 py-0.5 bg-amber-200 text-amber-900 text-[9px] uppercase font-black border border-amber-400">
                          BESTSELLER
                        </span>
                      )}
                    </td>
                    <td className="p-3 uppercase font-semibold text-gray-600">{p.category}</td>
                    <td className="p-3 font-heading font-black text-[#E63946]">
                      ৳{p.price.toLocaleString()}
                      {p.originalPrice && (
                        <span className="block text-[10px] text-gray-400 line-through">
                          ৳{p.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold">{p.stock ?? 20} units</td>
                    <td className="p-3">
                      {p.is_active !== false ? (
                        <span className="inline-flex items-center gap-1 text-[#111111] bg-emerald-100 border border-emerald-500 text-[10px] font-heading font-black px-2 py-0.5 uppercase">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-200 border border-gray-400 text-[10px] font-heading font-black px-2 py-0.5 uppercase">
                          <XCircle className="w-3 h-3 text-gray-500" /> Soft-Deleted
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 bg-[#111111] text-white border border-[#111111] shadow-[2px_2px_0px_#E63946] hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {p.is_active !== false && (
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 bg-red-600 text-white border border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-red-700 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                            title="Soft Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 font-body text-xs">
            No products matching current filter criteria.
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#111111] shadow-[8px_8px_0px_#111111] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
              <h3 className="font-heading font-black text-lg uppercase tracking-tight text-[#111111]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-[#111111] hover:bg-gray-200 border-2 border-[#111111] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 font-body text-xs">
              <div>
                <label className="block font-heading font-bold uppercase mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-heading font-bold uppercase mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-bold uppercase"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="home">Home & Living</option>
                    <option value="groceries">Groceries</option>
                  </select>
                </div>

                <div>
                  <label className="block font-heading font-bold uppercase mb-1">Subcategory</label>
                  <input
                    type="text"
                    placeholder="e.g. Headphones, Sarees"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-heading font-bold uppercase mb-1">Selling Price (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-heading font-bold uppercase mb-1">Original Price (BDT)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block font-heading font-bold uppercase mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-heading font-bold uppercase mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-heading font-bold uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-[#F7F7F5] border-2 border-[#111111]"
                ></textarea>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="w-4 h-4 accent-[#E63946]"
                  />
                  <span>Bestseller</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                    className="w-4 h-4 accent-[#E63946]"
                  />
                  <span>Trending</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#E63946]"
                  />
                  <span>Active on Storefront</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#111111]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border-2 border-[#111111] font-heading font-bold uppercase hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#111111] text-white border-2 border-[#111111] shadow-[4px_4px_0px_#E63946] font-heading font-black uppercase hover:bg-[#E63946] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM SOFT DELETE MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#111111] shadow-[8px_8px_0px_#E63946] w-full max-w-md p-6 space-y-4 font-body">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="font-heading font-black text-lg uppercase text-[#111111]">
                  Soft Delete Confirmation
                </h3>
                <p className="text-xs text-gray-600">
                  Are you sure you want to soft-delete <span className="font-bold text-[#111111]">{deletingProduct.name}</span>?
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 bg-amber-50 p-3 border border-amber-300">
              <strong>Note:</strong> To preserve past customer orders and order history referential integrity, this product will be flagged as <code className="font-mono font-bold">is_active = false</code> instead of hard-deleted. It will no longer appear on the public marketplace.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 border-2 border-[#111111] font-heading font-bold uppercase text-xs hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSoftDelete}
                disabled={saving}
                className="px-5 py-2 bg-red-600 text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-heading font-black uppercase text-xs hover:bg-red-700 cursor-pointer"
              >
                {saving ? 'Deactivating...' : 'Yes, Soft Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
