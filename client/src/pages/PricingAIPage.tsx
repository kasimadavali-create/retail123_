import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Check,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  History,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, PricingLog, PriceStrategy } from '../types/index.js';
import { api } from '../services/api.js';

interface PricingAIPageProps {
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (p: Product) => void;
  onPriceApplied: () => void;
}

export const PricingAIPage: React.FC<PricingAIPageProps> = ({
  products,
  selectedProduct,
  onProductSelect,
  onPriceApplied
}) => {
  const [product, setProduct] = useState<Product | null>(selectedProduct || products[0] || null);
  const [competitorPrice, setCompetitorPrice] = useState<number>(139.99);
  const [strategy, setStrategy] = useState<PriceStrategy>('Competitive Match');
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<PricingLog[]>([]);
  const [applying, setApplying] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // Result state
  const [result, setResult] = useState<{
    recommended_price: number;
    projected_margin_pct: number;
    strategy_type: PriceStrategy;
    strategy_rationale: string;
    demand_elasticity: number;
    expected_sales_lift_pct: number;
    promotional_tactics: string[];
    risk_assessment: string;
    is_ai_generated: boolean;
  } | null>(null);

  useEffect(() => {
    if (selectedProduct) {
      setProduct(selectedProduct);
      // Sensible initial competitor price based on product retail price
      setCompetitorPrice(Math.round((selectedProduct.retail_price * 0.95) * 100) / 100);
    } else if (products.length > 0 && !product) {
      setProduct(products[0]);
      setCompetitorPrice(Math.round((products[0].retail_price * 0.95) * 100) / 100);
    }
  }, [selectedProduct, products]);

  useEffect(() => {
    loadLogs();
  }, [product]);

  const loadLogs = async () => {
    try {
      const data = await api.getPricingLogs(product?.id);
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || competitorPrice <= 0) return;
    setLoading(true);
    setResult(null);
    setAppliedSuccess(false);

    try {
      const res = await api.optimizePrice({
        product_id: product.id,
        competitor_price: Number(competitorPrice),
        target_strategy: strategy
      });

      setResult(res.optimization);
      loadLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPrice = async () => {
    if (!product || !result) return;
    setApplying(true);
    try {
      await api.applyPrice(product.id, result.recommended_price);
      setAppliedSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onPriceApplied();
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>Gemini 2.5 Flash Dynamic Pricing Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              AI Pricing & Margin Strategist
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-2xl">
              Calibrate dynamic price points, analyze price elasticity, and maximize gross profit contribution without losing market share.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, AI Result Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameter Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span>Optimization Parameters</span>
            </h2>

            <form onSubmit={handleOptimize} className="space-y-4">
              {/* Product Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Select Product SKU
                </label>
                <select
                  value={product?.id || ''}
                  onChange={(e) => {
                    const found = products.find(p => p.id === e.target.value);
                    if (found) {
                      setProduct(found);
                      onProductSelect(found);
                      setCompetitorPrice(Math.round((found.retail_price * 0.95) * 100) / 100);
                      setResult(null);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.product_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Economics Summary Card */}
              {product && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Baseline Store Metrics
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Current Retail:</span>
                      <p className="font-bold text-white text-base">${product.retail_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Unit Cost:</span>
                      <p className="font-bold text-slate-300 text-base">${product.unit_cost.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Current Margin:</span>
                      <p className="font-bold text-emerald-400">{product.margin_pct}%</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Inventory Status:</span>
                      <p className="font-bold text-indigo-300">{product.stock_quantity} units ({product.stock_status})</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Competitor Price Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Current Competitor Market Price ($)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Amazon / Walmart index</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={competitorPrice}
                    onChange={(e) => setCompetitorPrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2.5 text-base font-bold text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Desired Strategy Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Strategic Optimization Goal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Competitive Match', 'Premium', 'High Margin', 'Clearance/Markdown'] as PriceStrategy[]).map((strat) => (
                    <button
                      key={strat}
                      type="button"
                      onClick={() => setStrategy(strat)}
                      className={`rounded-xl border p-2.5 text-left text-xs font-medium transition-all ${
                        strategy === strat
                          ? 'border-purple-500 bg-purple-950/40 text-purple-200 shadow-sm'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <div className="font-semibold text-white">{strat}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {strat === 'Competitive Match' && 'Undercut or match Buy Box'}
                        {strat === 'Premium' && 'Protect margin & brand equity'}
                        {strat === 'High Margin' && 'Maximize unit profit'}
                        {strat === 'Clearance/Markdown' && 'Liquidate excess inventory'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Run Optimizer Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{loading ? 'Synthesizing Elasticity & Strategy...' : 'Trigger Gemini Dynamic Pricing'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Output: AI Strategy Dossier */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="glass-panel rounded-2xl p-8 border border-purple-500/30 animate-shimmer min-h-[460px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-purple-600/20 flex items-center justify-center border border-purple-500/40 animate-pulse">
                  <Sparkles className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Gemini AI Generating Pricing Strategy</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Evaluating historical sales velocity ({product?.avg_monthly_sales} units/mo), competitor price ($
                  {competitorPrice.toFixed(2)}), and cross-price demand elasticity curves.
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="glass-panel rounded-2xl p-6 border border-purple-500/40 shadow-2xl space-y-6">
              {/* Top Result Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">
                      {result.strategy_type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {result.is_ai_generated ? 'Generated by Gemini 2.5 Flash' : 'Retail Economic Model'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">
                    AI Strategy Recommendation
                  </h3>
                </div>

                {/* Price Display */}
                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Recommended Price</span>
                  <div className="text-3xl font-black text-emerald-400">${result.recommended_price.toFixed(2)}</div>
                  <div className="text-xs text-slate-400">
                    from <span className="line-through">${product?.retail_price.toFixed(2)}</span> ({result.recommended_price > (product?.retail_price || 0) ? '+' : ''}
                    {Math.round(((result.recommended_price - (product?.retail_price || 0)) / (product?.retail_price || 1)) * 100)}%)
                  </div>
                </div>
              </div>

              {/* 3 Metrics Callouts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Projected Margin</span>
                  <p className="text-xl font-bold text-emerald-400 mt-0.5">{result.projected_margin_pct}%</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Demand Elasticity</span>
                  <p className="text-xl font-bold text-purple-400 mt-0.5">{result.demand_elasticity}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Expected Sales Lift</span>
                  <p className="text-xl font-bold text-sky-400 mt-0.5">
                    {result.expected_sales_lift_pct > 0 ? `+${result.expected_sales_lift_pct}%` : `${result.expected_sales_lift_pct}%`}
                  </p>
                </div>
              </div>

              {/* Strategy Rationale */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-300" />
                  <span>Executive Strategic Rationale</span>
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {result.strategy_rationale}
                </p>
              </div>

              {/* Promotional Tactics */}
              {result.promotional_tactics?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                    Tactical Promotional Levers
                  </h4>
                  <div className="space-y-1.5">
                    {result.promotional_tactics.map((tactic, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                        <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{tactic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              {result.risk_assessment && (
                <div className="flex items-start space-x-2 rounded-xl border border-amber-500/20 bg-amber-950/20 p-3">
                  <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/90 leading-relaxed">
                    <strong>Risk Assessment:</strong> {result.risk_assessment}
                  </div>
                </div>
              )}

              {/* Apply Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Ready to deploy to product catalog?
                </span>

                <button
                  type="button"
                  onClick={handleApplyPrice}
                  disabled={applying || appliedSuccess}
                  className={`flex items-center space-x-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-lg transition-all ${
                    appliedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-[1.02]'
                  }`}
                >
                  {appliedSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Applied to Catalog!</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{applying ? 'Updating...' : `Apply $${result.recommended_price.toFixed(2)} to Catalog`}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-10 border border-slate-800 min-h-[460px] flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
              <div className="h-12 w-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Price Analysis Run Yet</h3>
              <p className="text-xs max-w-sm">
                Select your product parameters and click "Trigger Gemini Dynamic Pricing" to generate real-time AI pricing strategies.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Pricing Logs */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
          <History className="h-4 w-4 text-indigo-400" />
          <span>Historical AI Dynamic Pricing Audit Logs</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Product / SKU</th>
                <th className="py-2.5 px-3">Strategy</th>
                <th className="py-2.5 px-3">Baseline</th>
                <th className="py-2.5 px-3">Competitor</th>
                <th className="py-2.5 px-3">AI Recommended</th>
                <th className="py-2.5 px-3">Projected Margin</th>
                <th className="py-2.5 px-3">Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    No previous optimization logs recorded for this product.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-300">
                      {log.sku || product?.sku}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-300 border border-purple-500/20">
                        {log.strategy_type || 'Competitive'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">${log.current_price.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-400">${log.competitor_price.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">${log.recommended_price.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-300">{log.projected_margin_pct}%</td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={log.strategy_rationale}>
                      {log.strategy_rationale}
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
