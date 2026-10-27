import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Sparkles,
  TrendingUp,
  Truck,
  History,
  Database,
  KeyRound,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenKeyModal: () => void;
  onResetSeed: () => void;
  isPostgres: boolean;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenKeyModal,
  onResetSeed,
  isPostgres,
  hasGeminiKey
}) => {
  const navItems = [
    { id: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: '/inventory', label: 'Inventory Catalog', icon: Boxes },
    { id: '/pricing-ai', label: 'AI Pricing Optimizer', icon: Sparkles, highlight: true },
    { id: '/forecasting', label: 'Demand Forecasting', icon: TrendingUp },
    { id: '/suppliers', label: 'Suppliers & Orders', icon: Truck },
    { id: '/audit', label: 'Inventory Ledger', icon: History }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand */}
        <div 
          onClick={() => onNavigate('/')}
          className="flex cursor-pointer items-center space-x-3 group"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 animate-pulse text-amber-200" />
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur group-hover:opacity-75 transition duration-300"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white font-mono">RetailPulse</span>
              <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/30">AI</span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Inventory & Dynamic Pricing</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                } ${item.highlight && !active ? 'text-purple-300 hover:text-purple-200' : ''}`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-indigo-400' : item.highlight ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicators & Action Tools */}
        <div className="flex items-center space-x-2.5">
          {/* DB Status */}
          <div 
            title={isPostgres ? "Connected to PostgreSQL Database" : "Using Persistent Local Store"}
            className="flex items-center space-x-1.5 rounded-full bg-slate-900 border border-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300"
          >
            <Database className={`h-3 w-3 ${isPostgres ? 'text-emerald-400' : 'text-sky-400'}`} />
            <span className="hidden sm:inline">{isPostgres ? 'PostgreSQL' : 'Local DB'}</span>
          </div>

          {/* Gemini AI Status */}
          <button
            onClick={onOpenKeyModal}
            className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all ${
              hasGeminiKey
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/40'
                : 'bg-amber-950/50 border-amber-500/30 text-amber-300 hover:bg-amber-900/40'
            }`}
          >
            <KeyRound className="h-3 w-3 text-amber-400" />
            <span className="hidden sm:inline">{hasGeminiKey ? 'Gemini 2.5 Flash' : 'Set Gemini Key'}</span>
          </button>

          {/* Reset Seed Button */}
          <button
            onClick={onResetSeed}
            title="Reset to default seed data"
            className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden lg:inline">Reset Seed</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="flex md:hidden border-t border-slate-800/60 overflow-x-auto px-4 py-2 space-x-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center space-x-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${
                active
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
