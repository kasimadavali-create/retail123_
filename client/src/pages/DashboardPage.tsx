import React from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Boxes,
  ArrowUpRight,
  Flame,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  PieChart as PieIcon,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { DashboardStats } from '../types/index.js';

interface DashboardPageProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  loading,
  onNavigate
}) => {
  if (loading || !stats) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Loading retail analytics & telemetry...</p>
        </div>
      </div>
    );
  }

  const {
    totalInventoryCost,
    totalRetailValuation,
    totalUnitsInStock,
    projectedMonthlyRevenue,
    projectedMonthlyProfit,
    averageMarginPct,
    stockCounts,
    alerts,
    fastMoving,
    categoryDistribution,
    revenueTrajectory
  } = stats;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 bottom-0 h-40 w-40 rounded-full bg-purple-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Real-Time Retail Intelligence Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Executive Inventory & Dynamic Pricing Command
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Automated telemetry synthesizing stock velocity, supplier replenishment lead times, and Gemini AI dynamic margin optimization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/pricing-ai')}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Price Optimizer</span>
            </button>
            <button
              onClick={() => onNavigate('/inventory')}
              className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Boxes className="h-4 w-4" />
              <span>Manage Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory Valuation */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inventory Valuation</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white">${totalRetailValuation.toLocaleString()}</h3>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">Cost Basis: ${totalInventoryCost.toLocaleString()}</span>
              <span className="font-semibold text-indigo-400">{totalUnitsInStock} units</span>
            </div>
          </div>
        </div>

        {/* Projected Monthly Revenue */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Run-Rate Rev</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white">${projectedMonthlyRevenue.toLocaleString()}</h3>
            <div className="mt-1 flex items-center space-x-1.5 text-xs text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Est. Profit: ${projectedMonthlyProfit.toLocaleString()}/mo</span>
            </div>
          </div>
        </div>

        {/* Average Margin % */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Gross Margin</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white">{averageMarginPct}%</h3>
            <div className="mt-1 flex items-center text-xs text-purple-300">
              <span>Dynamic pricing elasticity calibrated</span>
            </div>
          </div>
        </div>

        {/* Stock Alerts Count */}
        <div 
          onClick={() => onNavigate('/inventory')}
          className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk Alerts</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white">{alerts.length}</h3>
            <div className="mt-1 flex items-center space-x-2 text-xs">
              <span className="font-semibold text-rose-400">{stockCounts.critical} Critical</span>
              <span className="text-slate-500">•</span>
              <span className="font-semibold text-amber-400">{stockCounts.low} Low Stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Action Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span>Urgent Operational Inventory Alerts</span>
            </h2>
            <span className="text-xs text-slate-400">Prioritized by stockout countdown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl p-4 border transition-all ${
                  alert.level === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-500/40 hover:bg-rose-950/30'
                    : alert.level === 'WARNING'
                    ? 'bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/30'
                    : 'bg-sky-950/20 border-sky-500/40 hover:bg-sky-950/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      alert.level === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300'
                        : alert.level === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-sky-500/20 text-sky-300'
                    }`}
                  >
                    {alert.level}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{alert.sku}</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-white">{alert.title}</h4>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{alert.description}</p>
                <button
                  onClick={() => onNavigate(alert.actionUrl)}
                  className="mt-3 flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>Take action</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts: Trajectory & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Margin Trajectory (Area Chart) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-white">6-Month Revenue & Margin Trajectory</h3>
              <p className="text-xs text-slate-400">Predictive monthly revenue and gross profit forecast</p>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                <span className="text-slate-300">Revenue</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-300">Gross Profit</span>
              </div>
            </div>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="grossProfit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Gross Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Health Breakdown & Distribution */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <PieIcon className="h-4 w-4 text-purple-400" />
                <span>Inventory Health Scorecard</span>
              </h3>
              <p className="text-xs text-slate-400">Stock level distribution across active catalog</p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-400">Critical Stock (&lt; 5 units)</span>
                  <span className="text-white">{stockCounts.critical} products</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(stockCounts.critical / Math.max(1, stats.totalProducts)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-400">Low Stock (&lt; 15 units)</span>
                  <span className="text-white">{stockCounts.low} products</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(stockCounts.low / Math.max(1, stats.totalProducts)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-400">Optimal Stock (15 - 200 units)</span>
                  <span className="text-white">{stockCounts.optimal} products</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(stockCounts.optimal / Math.max(1, stats.totalProducts)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-sky-400">Overstocked (&gt; 200 units)</span>
                  <span className="text-white">{stockCounts.overstocked} products</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${(stockCounts.overstocked / Math.max(1, stats.totalProducts)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-3.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
              <p className="text-xs text-indigo-200">
                <strong>Optimizer Tip:</strong> Overstocked items tie up capital. Run Gemini clearance markdown to recover cash velocity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Fast-Moving Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Valuation Bar Chart */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Inventory Valuation by Category</h3>
            <p className="text-xs text-slate-400">Total retail asset allocation across merchandise categories</p>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, 'Valuation']}
                />
                <Bar dataKey="retailValuation" fill="#818cf8" radius={[6, 6, 0, 0]} name="Retail Valuation" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fast-Moving Items Leaderboard */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <span>Fast-Moving Revenue Leaders</span>
              </h3>
              <p className="text-xs text-slate-400">Ranked by monthly sales velocity and turnover days</p>
            </div>
            <button
              onClick={() => onNavigate('/inventory')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View all
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-800/80">
            {fastMoving.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="min-w-0 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-300">{item.sku}</span>
                    <span className="text-[11px] text-slate-500 font-medium">({item.category})</span>
                  </div>
                  <p className="text-xs font-medium text-white truncate max-w-xs">{item.product_name}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-400">${item.monthlyRevenue.toLocaleString()}/mo</span>
                  <div className="flex items-center justify-end space-x-1 text-[11px] text-slate-400">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>{item.stockTurnoverDays} days of supply</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
