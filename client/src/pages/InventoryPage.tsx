import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  Sparkles,
  Truck,
  Edit3,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Package
} from 'lucide-react';
import { Product, StockStatus } from '../types/index.js';

interface InventoryPageProps {
  products: Product[];
  loading: boolean;
  onAdjustStock: (product: Product) => void;
  onTriggerPricingAI: (product: Product) => void;
  onTriggerPO: (product: Product) => void;
  onOpenNewProductModal: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  products,
  loading,
  onAdjustStock,
  onTriggerPricingAI,
  onTriggerPO,
  onOpenNewProductModal
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const categories = ['ALL', 'Electronics', 'Apparel', 'Home & Kitchen', 'Health & Beauty', 'Sports & Outdoors'];
  const statuses: Array<{ key: string; label: string; count: number }> = [
    { key: 'ALL', label: 'All Catalog', count: products.length },
    { key: 'Critical Stock', label: 'Critical (< 5)', count: products.filter(p => p.stock_status === 'Critical Stock').length },
    { key: 'Low Stock', label: 'Low (< 15)', count: products.filter(p => p.stock_status === 'Low Stock').length },
    { key: 'Optimal', label: 'Optimal', count: products.filter(p => p.stock_status === 'Optimal').length },
    { key: 'Overstocked', label: 'Overstocked (> 200)', count: products.filter(p => p.stock_status === 'Overstocked').length }
  ];

  const filtered = products.filter(p => {
    const matchSearch =
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchStatus = selectedStatus === 'ALL' || p.stock_status === selectedStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'Critical Stock':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
            <AlertCircle className="h-3 w-3" />
            <span>Critical Stock</span>
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
            <AlertTriangle className="h-3 w-3" />
            <span>Low Stock</span>
          </span>
        );
      case 'Overstocked':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-sky-500/20 border border-sky-500/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
            <Package className="h-3 w-3" />
            <span>Overstocked</span>
          </span>
        );
      case 'Optimal':
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            <span>Optimal</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
            <Boxes className="h-6 w-6 text-indigo-400" />
            <span>Inventory Catalog & Stock Manager</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time item-level stock monitoring, valuation ledger, and restocking controls.
          </p>
        </div>

        <button
          onClick={onOpenNewProductModal}
          className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product SKU</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU code (e.g. ELE-401) or product title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-2 shrink-0">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {statuses.map(s => {
            const active = selectedStatus === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSelectedStatus(s.key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{s.label}</span>
                <span className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${active ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'}`}>
                  {s.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">SKU / Product</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Stock Level</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Cost / Retail</th>
                <th className="py-3.5 px-3">Gross Margin</th>
                <th className="py-3.5 px-3">Velocity & Supply</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-900/60 transition-colors">
                    {/* SKU & Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-indigo-300">{product.sku}</div>
                      <div className="font-semibold text-white max-w-xs truncate" title={product.product_name}>
                        {product.product_name}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                        {product.category}
                      </span>
                    </td>

                    {/* Stock Level */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-bold text-white">{product.stock_quantity}</span>
                        <span className="text-[11px] text-slate-400">units</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Valuation: ${product.inventory_valuation.toLocaleString()}
                      </div>
                    </td>

                    {/* Stock Status Badge */}
                    <td className="py-3.5 px-3">
                      {getStatusBadge(product.stock_status)}
                    </td>

                    {/* Cost / Retail */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">${product.retail_price.toFixed(2)}</div>
                      <div className="text-[11px] text-slate-400">Cost: ${product.unit_cost.toFixed(2)}</div>
                    </td>

                    {/* Gross Margin */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-emerald-400">{product.margin_pct}%</div>
                      <div className="text-[11px] text-slate-400">+${product.margin_dollar.toFixed(2)} / unit</div>
                    </td>

                    {/* Velocity & Supply */}
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-200">
                        {product.avg_monthly_sales} <span className="text-[10px] text-slate-400">units/mo</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {product.days_of_supply} days supply
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Adjust Stock */}
                        <button
                          onClick={() => onAdjustStock(product)}
                          title="Adjust stock and record audit ledger"
                          className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {/* AI Price Optimize */}
                        <button
                          onClick={() => onTriggerPricingAI(product)}
                          title="Trigger Gemini AI dynamic pricing optimization"
                          className="rounded-lg border border-purple-500/30 bg-purple-950/50 p-1.5 text-purple-300 hover:bg-purple-900/60 transition-colors"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        </button>

                        {/* Order Restock PO */}
                        <button
                          onClick={() => onTriggerPO(product)}
                          title="Generate replenishment purchase order"
                          className="rounded-lg border border-indigo-500/30 bg-indigo-950/50 p-1.5 text-indigo-300 hover:bg-indigo-900/60 transition-colors"
                        >
                          <Truck className="h-3.5 w-3.5 text-indigo-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
