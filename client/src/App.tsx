import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { GeminiKeyModal } from './components/GeminiKeyModal.js';
import { StockAdjustmentModal } from './components/StockAdjustmentModal.js';
import { CreatePOModal } from './components/CreatePOModal.js';
import { NewProductModal } from './components/NewProductModal.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { InventoryPage } from './pages/InventoryPage.js';
import { PricingAIPage } from './pages/PricingAIPage.js';
import { ForecastingPage } from './pages/ForecastingPage.js';
import { SuppliersPage } from './pages/SuppliersPage.js';
import { AuditLogPage } from './pages/AuditLogPage.js';
import { Product, Supplier, DashboardStats } from './types/index.js';
import { api, getCustomGeminiKey } from './services/api.js';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // System & Environment Status
  const [isPostgres, setIsPostgres] = useState<boolean>(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);

  // Modals state
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState<boolean>(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [selectedPricingProduct, setSelectedPricingProduct] = useState<Product | null>(null);

  // PO Modal state
  const [isPOModalOpen, setIsPOModalOpen] = useState<boolean>(false);
  const [poInitialProduct, setPoInitialProduct] = useState<string | undefined>(undefined);
  const [poInitialQuantity, setPoInitialQuantity] = useState<number | undefined>(undefined);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [health, prodList, supList, statData] = await Promise.all([
        api.getHealth(),
        api.getProducts(),
        api.getSuppliers(),
        api.getDashboardStats()
      ]);

      setIsPostgres(health.postgres_connected);
      setHasGeminiKey(Boolean(health.gemini_key_detected || getCustomGeminiKey()));
      setProducts(prodList);
      setSuppliers(supList);
      setStats(statData);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustmentSubmit = async (
    id: string,
    newStock: number,
    reason: string,
    changeType: 'RESTOCK' | 'ADJUSTMENT' | 'SALE' | 'CYCLE_COUNT',
    location: string
  ) => {
    await api.updateStock(id, newStock, reason, changeType, location);
    showToast('Stock level updated and logged to audit ledger.');
    loadInitialData();
  };

  const handleCreateProductSubmit = async (data: any) => {
    await api.createProduct(data);
    showToast(`SKU ${data.sku} successfully onboarded.`);
    loadInitialData();
  };

  const handleCreatePOSubmit = async (supplierId: string, productId: string, quantity: number) => {
    await api.createPurchaseOrder({ supplier_id: supplierId, product_id: productId, quantity });
    showToast('Replenishment purchase order generated.');
    loadInitialData();
  };

  const handleResetSeed = async () => {
    if (window.confirm('Reset all catalog and transaction data to default seed?')) {
      try {
        await api.resetSeedData();
        showToast('Catalog reset to default seed records.');
        loadInitialData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-indigo-500/40 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onResetSeed={handleResetSeed}
        isPostgres={isPostgres}
        hasGeminiKey={hasGeminiKey}
      />

      {/* Main Page Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {currentRoute === '/' && (
          <DashboardPage
            stats={stats}
            loading={loading}
            onNavigate={(route) => setCurrentRoute(route)}
          />
        )}

        {currentRoute === '/inventory' && (
          <InventoryPage
            products={products}
            loading={loading}
            onAdjustStock={(p) => setAdjustingProduct(p)}
            onTriggerPricingAI={(p) => {
              setSelectedPricingProduct(p);
              setCurrentRoute('/pricing-ai');
            }}
            onTriggerPO={(p) => {
              setPoInitialProduct(p.id);
              setPoInitialQuantity(50);
              setIsPOModalOpen(true);
            }}
            onOpenNewProductModal={() => setIsNewProductModalOpen(true)}
          />
        )}

        {currentRoute === '/pricing-ai' && (
          <PricingAIPage
            products={products}
            selectedProduct={selectedPricingProduct}
            onProductSelect={(p) => setSelectedPricingProduct(p)}
            onPriceApplied={() => {
              showToast('Price updated across catalog!');
              loadInitialData();
            }}
          />
        )}

        {currentRoute === '/forecasting' && (
          <ForecastingPage
            onTriggerPO={(p, suggestedQty) => {
              setPoInitialProduct(p.id);
              setPoInitialQuantity(suggestedQty || 50);
              setIsPOModalOpen(true);
            }}
          />
        )}

        {currentRoute === '/suppliers' && (
          <SuppliersPage
            products={products}
            onOpenCreatePO={() => {
              setPoInitialProduct(products[0]?.id);
              setPoInitialQuantity(50);
              setIsPOModalOpen(true);
            }}
            onStockUpdated={() => {
              showToast('Shipment received! Inventory restocked automatically.');
              loadInitialData();
            }}
          />
        )}

        {currentRoute === '/audit' && (
          <AuditLogPage />
        )}
      </main>

      {/* Modals */}
      <GeminiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={(k) => setHasGeminiKey(Boolean(k))}
      />

      <StockAdjustmentModal
        product={adjustingProduct}
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        onSubmit={handleStockAdjustmentSubmit}
      />

      <CreatePOModal
        isOpen={isPOModalOpen}
        onClose={() => {
          setIsPOModalOpen(false);
          setPoInitialProduct(undefined);
          setPoInitialQuantity(undefined);
        }}
        products={products}
        suppliers={suppliers}
        initialProductId={poInitialProduct}
        initialQuantity={poInitialQuantity}
        onSubmit={handleCreatePOSubmit}
      />

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onSubmit={handleCreateProductSubmit}
      />
    </div>
  );
};

export default App;
