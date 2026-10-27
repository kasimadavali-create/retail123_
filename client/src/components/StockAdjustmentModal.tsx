import React, { useState } from 'react';
import { X, Boxes, Save } from 'lucide-react';
import { Product } from '../types/index.js';

interface StockAdjustmentModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, newStock: number, reason: string, changeType: 'RESTOCK' | 'ADJUSTMENT' | 'SALE' | 'CYCLE_COUNT', location: string) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen || !product) return null;

  const [newStock, setNewStock] = useState<number>(product.stock_quantity);
  const [reason, setReason] = useState<string>('Physical cycle count inventory adjustment');
  const [changeType, setChangeType] = useState<'RESTOCK' | 'ADJUSTMENT' | 'SALE' | 'CYCLE_COUNT'>('ADJUSTMENT');
  const [location, setLocation] = useState<string>('Main Warehouse - Bay A-12');
  const [loading, setLoading] = useState(false);

  const delta = newStock - product.stock_quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStock < 0) return;
    setLoading(true);
    try {
      await onSubmit(product.id, newStock, reason, changeType, location);
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Adjust Stock Level</h3>
            <p className="text-xs text-slate-400 font-mono">{product.sku} • {product.product_name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Current Stock</span>
              <p className="text-xl font-bold text-white mt-0.5">{product.stock_quantity} units</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Net Change</span>
              <p className={`text-xl font-bold mt-0.5 ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {delta > 0 ? `+${delta}` : delta} units
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              New Verified Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              required
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-base font-semibold text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Adjustment Reason Type
              </label>
              <select
                value={changeType}
                onChange={(e: any) => setChangeType(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="ADJUSTMENT">Manual Adjustment</option>
                <option value="RESTOCK">Supplier Restock</option>
                <option value="CYCLE_COUNT">Cycle Count Audit</option>
                <option value="SALE">Direct Fulfillment Sale</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Warehouse Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Audit Note / Ledger Explanation
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Discrepancy noted during Friday afternoon warehouse inspection"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
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
              className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{loading ? 'Recording...' : 'Update & Log Audit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
