import React, { useState, useEffect } from 'react';
import { History, Search, ArrowUp, ArrowDown, MapPin, RefreshCw } from 'lucide-react';
import { AuditLog } from '../types/index.js';
import { api } from '../services/api.js';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l => {
    const matchSearch =
      l.product_name.toLowerCase().includes(search.toLowerCase()) ||
      l.product_sku.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType === 'ALL' || l.change_type === selectedType;
    return matchSearch && matchType;
  });

  const getChangeBadge = (type: AuditLog['change_type']) => {
    switch (type) {
      case 'RESTOCK':
        return <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/30">RESTOCK</span>;
      case 'SALE':
        return <span className="rounded bg-sky-500/20 text-sky-300 px-2 py-0.5 text-[10px] font-bold border border-sky-500/30">SALE FULFILLMENT</span>;
      case 'CYCLE_COUNT':
        return <span className="rounded bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[10px] font-bold border border-purple-500/30">CYCLE COUNT</span>;
      case 'INITIAL':
        return <span className="rounded bg-indigo-500/20 text-indigo-300 px-2 py-0.5 text-[10px] font-bold border border-indigo-500/30">INITIAL INTAKE</span>;
      case 'ADJUSTMENT':
      default:
        return <span className="rounded bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-bold border border-amber-500/30">ADJUSTMENT</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
            <History className="h-6 w-6 text-indigo-400" />
            <span>Inventory Ledger & Immutable Audit Log</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Item-level stock adjustments, cycle counts, incoming supplier restocks, and warehouse bay locations.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU, product name, warehouse bay, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="RESTOCK">Supplier Restock</option>
            <option value="ADJUSTMENT">Manual Adjustment</option>
            <option value="CYCLE_COUNT">Cycle Count Audit</option>
            <option value="SALE">Sale Fulfillment</option>
            <option value="INITIAL">Initial Intake</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">SKU & Item</th>
                <th className="py-3 px-3">Event Type</th>
                <th className="py-3 px-3">Previous</th>
                <th className="py-3 px-3">Adjustment</th>
                <th className="py-3 px-3">New Balance</th>
                <th className="py-3 px-3">Warehouse Location</th>
                <th className="py-3 px-4">Ledger Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No audit records matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-indigo-300">{log.product_sku}</div>
                      <div className="text-white font-medium truncate max-w-xs">{log.product_name}</div>
                    </td>

                    <td className="py-3 px-3">
                      {getChangeBadge(log.change_type)}
                    </td>

                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {log.previous_stock}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold">
                      <div className={`flex items-center space-x-1 ${log.quantity_change > 0 ? 'text-emerald-400' : log.quantity_change < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {log.quantity_change > 0 ? <ArrowUp className="h-3 w-3" /> : log.quantity_change < 0 ? <ArrowDown className="h-3 w-3" /> : null}
                        <span>{log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-white font-bold font-mono">
                      {log.new_stock}
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{log.location}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300 max-w-sm truncate" title={log.reason}>
                      {log.reason}
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
