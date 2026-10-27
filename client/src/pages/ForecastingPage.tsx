import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Calendar,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ForecastItem } from '../types/index.js';
import { api } from '../services/api.js';

interface ForecastingPageProps {
  onTriggerPO: (product: any, suggestedQty?: number) => void;
}

export const ForecastingPage: React.FC<ForecastingPageProps> = ({ onTriggerPO }) => {
  const [data, setData] = useState<{
    summary: { criticalCount: number; reorderNeededCount: number; avgDaysOfSupply: number };
    forecasts: ForecastItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedForecast, setSelectedForecast] = useState<ForecastItem | null>(null);

  useEffect(() => {
    loadForecasting();
  }, []);

  const loadForecasting = async () => {
    try {
      setLoading(true);
      const res = await api.getForecasting();
      setData(res);
      if (res.forecasts.length > 0) {
        setSelectedForecast(res.forecasts[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          <p className="text-xs text-slate-400">Computing 30-day sales velocity projections...</p>
        </div>
      </div>
    );
  }

  const { summary, forecasts } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-indigo-400" />
          <span>Demand Forecasting & Stock Depletion Engine</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Projected 30-day sales velocities, automated reorder points (ROP), and stockout countdown timers.
        </p>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-rose-500/20 bg-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Stockout Imminent (&lt; Lead Time)</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{summary.criticalCount} SKUs</p>
          <p className="text-[11px] text-rose-200/70 mt-0.5">Depletion occurs before standard supplier delivery</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-amber-500/20 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Reorder Point Triggered</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{summary.reorderNeededCount} SKUs</p>
          <p className="text-[11px] text-amber-200/70 mt-0.5">Buffer reached safety threshold</p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-indigo-500/20 bg-indigo-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Warehouse Runway Avg</span>
            <Calendar className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400 mt-2">{summary.avgDaysOfSupply} Days</p>
          <p className="text-[11px] text-indigo-200/70 mt-0.5">Weighted average across total inventory catalog</p>
        </div>
      </div>

      {/* Selected Product 30-Day Trajectory Curve */}
      {selectedForecast && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-indigo-300">{selectedForecast.sku}</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">{selectedForecast.category}</span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  selectedForecast.urgency === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                  selectedForecast.urgency === 'SOON' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {selectedForecast.urgency}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{selectedForecast.product_name}</h3>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-right">
                <span className="text-[10px] text-slate-400 uppercase">Stockout Countdown</span>
                <p className="font-bold text-rose-400">{selectedForecast.days_until_stockout} days left</p>
              </div>
              <button
                onClick={() => onTriggerPO({ id: selectedForecast.product_id, sku: selectedForecast.sku, product_name: selectedForecast.product_name }, selectedForecast.recommended_reorder_qty)}
                className="flex items-center space-x-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/30"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Issue Reorder PO ({selectedForecast.recommended_reorder_qty} units)</span>
              </button>
            </div>
          </div>

          {/* Depletion Curve Recharts */}
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedForecast.projections} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="projectedStock"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  name="Projected Remaining Stock"
                />
                <Line
                  type="monotone"
                  dataKey="projectedDemand"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  name="Cumulative Demand"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Forecasting Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">SKU Depletion & Reorder ROP Index</h3>
          <span className="text-xs text-slate-400">Click any product row to view depletion curves</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">SKU / Product</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Daily Velocity</th>
                <th className="py-3 px-3">Days to Stockout</th>
                <th className="py-3 px-3">Est. Depletion Date</th>
                <th className="py-3 px-3">Lead Time</th>
                <th className="py-3 px-3">Reorder Point (ROP)</th>
                <th className="py-3 px-3">Recommended PO Qty</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {forecasts.map((f) => {
                const isSelected = selectedForecast?.product_id === f.product_id;
                return (
                  <tr
                    key={f.product_id}
                    onClick={() => setSelectedForecast(f)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-300">{f.sku}</span>
                      <p className="font-medium text-white truncate max-w-xs">{f.product_name}</p>
                    </td>

                    <td className="py-3 px-3 font-bold text-white">{f.current_stock} units</td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-200">{f.daily_velocity}</span>
                      <span className="text-[10px] text-slate-400 ml-1">units/day</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        f.urgency === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        f.urgency === 'SOON' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span>{f.days_until_stockout} days</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {new Date(f.depletion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3 px-3 text-slate-400 font-medium">{f.lead_time_days} days</td>

                    <td className="py-3 px-3 font-bold text-amber-400">
                      {f.reorder_point} units
                      <span className="text-[10px] text-slate-500 block">Safety: +{f.safety_stock}</span>
                    </td>

                    <td className="py-3 px-3 font-bold text-purple-300">
                      {f.recommended_reorder_qty} units
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onTriggerPO({ id: f.product_id, sku: f.sku, product_name: f.product_name }, f.recommended_reorder_qty)}
                        className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        Reorder PO
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
