import React, { useState, useEffect } from 'react';
import { X, Truck, FileText } from 'lucide-react';
import { Product, Supplier } from '../types/index.js';

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  suppliers: Supplier[];
  initialProductId?: string;
  initialQuantity?: number;
  onSubmit: (supplierId: string, productId: string, quantity: number) => Promise<void>;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({
  isOpen,
  onClose,
  products,
  suppliers,
  initialProductId,
  initialQuantity,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [productId, setProductId] = useState<string>(initialProductId || products[0]?.id || '');
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(initialQuantity || 50);
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find(p => p.id === productId);
  const selectedSupplier = suppliers.find(s => s.id === supplierId);

  useEffect(() => {
    if (initialProductId) setProductId(initialProductId);
    if (initialQuantity) setQuantity(initialQuantity);
  }, [initialProductId, initialQuantity]);

  // Auto-select preferred supplier based on category if possible
  useEffect(() => {
    if (selectedProduct && suppliers.length > 0) {
      const matchingSupplier = suppliers.find(s => s.categories?.includes(selectedProduct.category));
      if (matchingSupplier) {
        setSupplierId(matchingSupplier.id);
      }
    }
  }, [selectedProduct, suppliers]);

  const unitCost = selectedProduct?.unit_cost || 0;
  const totalAmount = unitCost * quantity;
  const leadDays = selectedSupplier?.lead_time_days || 10;
  const expectedDate = new Date(Date.now() + leadDays * 86400000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !productId || quantity <= 0) return;
    setLoading(true);
    try {
      await onSubmit(supplierId, productId, quantity);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Generate Restock Purchase Order</h3>
            <p className="text-xs text-slate-400">Automated vendor procurement & shipment scheduling</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Select Product SKU
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.product_name} (Current Stock: {p.stock_quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Select Supplier / Vendor
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.supplier_name} (Lead: {s.lead_time_days} days • Rating: {s.reliability_rating}★)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Reorder Quantity (Units)
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-base font-semibold text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Cost & Logistics Preview */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Unit Cost:</span>
              <span className="font-semibold text-white">${unitCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Vendor Lead Time:</span>
              <span className="font-semibold text-sky-400">{leadDays} days</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Est. Delivery Date:</span>
              <span className="font-semibold text-emerald-400">{expectedDate}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold">
              <span className="text-slate-300">Total PO Amount:</span>
              <span className="text-indigo-400">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 rounded-lg bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-colors disabled:opacity-50"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{loading ? 'Creating...' : 'Issue Purchase Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
