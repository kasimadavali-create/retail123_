import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Star,
  Clock,
  Mail,
  CheckCircle2,
  Package,
  Calendar,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Supplier, PurchaseOrder, Product } from '../types/index.js';
import { api } from '../services/api.js';

interface SuppliersPageProps {
  products: Product[];
  onOpenCreatePO: () => void;
  onStockUpdated: () => void;
}

export const SuppliersPage: React.FC<SuppliersPageProps> = ({
  products,
  onOpenCreatePO,
  onStockUpdated
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);

  // New Supplier Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [leadDays, setLeadDays] = useState(10);
  const [rating, setRating] = useState(4.8);
  const [category, setCategory] = useState('Electronics');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [supList, poList] = await Promise.all([
        api.getSuppliers(),
        api.getPurchaseOrders()
      ]);
      setSuppliers(supList);
      setOrders(poList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    try {
      const created = await api.createSupplier({
        supplier_name: name,
        contact_email: email,
        lead_time_days: Number(leadDays),
        reliability_rating: Number(rating),
        categories: [category]
      });
      setSuppliers([...suppliers, created]);
      setIsAddingSupplier(false);
      setName('');
      setEmail('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (poId: string, status: PurchaseOrder['status']) => {
    try {
      await api.updatePurchaseOrderStatus(poId, status);
      if (status === 'RECEIVED') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        onStockUpdated();
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
            <Truck className="h-6 w-6 text-indigo-400" />
            <span>Supplier Directory & Procurement Orders</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Monitor vendor fulfillment reliability, delivery lead times, and active restock purchase orders.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddingSupplier(!isAddingSupplier)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {isAddingSupplier ? 'Cancel' : 'Add Supplier Profile'}
          </button>
          <button
            onClick={onOpenCreatePO}
            className="flex items-center space-x-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Issue Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Add Supplier Form (Collapsible) */}
      {isAddingSupplier && (
        <form onSubmit={handleCreateSupplier} className="glass-panel rounded-2xl p-5 border border-indigo-500/30 space-y-4">
          <h3 className="text-sm font-bold text-white">Add New Supplier Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Company / Vendor Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Precision Parts Ltd"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@company.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={leadDays}
                onChange={(e) => setLeadDays(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Reliability (1 - 5 ★)</label>
              <input
                type="number"
                step="0.05"
                min="1"
                max="5"
                required
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value) || 4.5)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none"
              >
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Sports & Outdoors">Sports & Outdoors</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Save Vendor
            </button>
          </div>
        </form>
      )}

      {/* Supplier Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                  {s.categories?.[0] || 'General'}
                </span>
                <div className="flex items-center space-x-1 text-xs font-bold text-amber-300">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{s.reliability_rating}</span>
                </div>
              </div>
              <h4 className="mt-2 text-sm font-bold text-white line-clamp-1" title={s.supplier_name}>
                {s.supplier_name}
              </h4>
              <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-400">
                <Mail className="h-3 w-3 text-slate-500" />
                <span className="truncate">{s.contact_email}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Avg Lead Time:</span>
              <span className="font-bold text-sky-400 flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{s.lead_time_days} days</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Orders Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Replenishment Purchase Orders</h3>
            <p className="text-xs text-slate-400">Track shipments from dispatch to warehouse receipt</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">{orders.length} Active Orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">SKU & Item</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3">Unit Cost / Total</th>
                <th className="py-3 px-3">Est. Delivery</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-300">
                    {po.po_number}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {po.supplier_name}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-slate-300 mr-1.5 font-bold">{po.sku}</span>
                    <span className="text-slate-400 truncate max-w-xs">{po.product_name}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-white">
                    {po.quantity} units
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">${po.total_amount.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500">${po.unit_cost.toFixed(2)} / unit</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {new Date(po.expected_delivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      po.status === 'RECEIVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      po.status === 'IN_TRANSIT' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                      'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {po.status === 'RECEIVED' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      <span>{po.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {po.status === 'ORDERED' && (
                      <button
                        onClick={() => handleUpdateStatus(po.id, 'IN_TRANSIT')}
                        className="rounded-lg bg-sky-600/20 border border-sky-500/30 px-2.5 py-1 text-xs font-semibold text-sky-300 hover:bg-sky-600 hover:text-white transition-colors"
                      >
                        Dispatch / In Transit
                      </button>
                    )}
                    {po.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleUpdateStatus(po.id, 'RECEIVED')}
                        className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        Receive & Restock
                      </button>
                    )}
                    {po.status === 'RECEIVED' && (
                      <span className="text-[11px] text-slate-500 font-medium">Inventory Restocked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
