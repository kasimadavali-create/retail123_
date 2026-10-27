import {
  Product,
  PricingLog,
  Supplier,
  PurchaseOrder,
  AuditLog,
  ForecastItem,
  DashboardStats,
  PriceStrategy
} from '../types/index.js';

const API_BASE = '/api';

export function getCustomGeminiKey(): string {
  return localStorage.getItem('retailpulse_gemini_key') || '';
}

export function setCustomGeminiKey(key: string): void {
  if (key) {
    localStorage.setItem('retailpulse_gemini_key', key);
  } else {
    localStorage.removeItem('retailpulse_gemini_key');
  }
}

export const api = {
  // Health
  async getHealth(): Promise<{ status: string; postgres_connected: boolean; gemini_key_detected: boolean }> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load dashboard stats');
    return json.data;
  },

  // Products
  async getProducts(params?: { category?: string; status?: string; search?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'ALL') query.set('category', params.category);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load products');
    return json.data;
  },

  async getProductById(id: string): Promise<Product & { pricing_logs: PricingLog[]; audit_logs: AuditLog[] }> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load product details');
    return json.data;
  },

  async createProduct(data: {
    sku: string;
    product_name: string;
    category: string;
    stock_quantity: number;
    unit_cost: number;
    retail_price: number;
    avg_monthly_sales: number;
  }): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create product');
    return json.data;
  },

  async updateStock(
    id: string,
    newStock: number,
    reason: string,
    changeType: 'RESTOCK' | 'ADJUSTMENT' | 'SALE' | 'CYCLE_COUNT' = 'ADJUSTMENT',
    location = 'Main Warehouse'
  ): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_stock: newStock,
        reason,
        change_type: changeType,
        location
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update stock');
    return json.data;
  },

  // AI Pricing Optimizer
  async optimizePrice(params: {
    product_id: string;
    competitor_price: number;
    target_strategy: PriceStrategy;
    notes?: string;
  }): Promise<{
    log_id: string;
    product: Product;
    optimization: {
      recommended_price: number;
      projected_margin_pct: number;
      strategy_type: PriceStrategy;
      strategy_rationale: string;
      demand_elasticity: number;
      expected_sales_lift_pct: number;
      promotional_tactics: string[];
      risk_assessment: string;
      is_ai_generated: boolean;
    };
  }> {
    const customKey = getCustomGeminiKey();
    const res = await fetch(`${API_BASE}/pricing/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        custom_gemini_key: customKey || undefined
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Pricing optimization failed');
    return json.data;
  },

  async applyPrice(productId: string, newPrice: number): Promise<Product> {
    const res = await fetch(`${API_BASE}/pricing/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, new_price: newPrice })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to apply new price');
    return json.data;
  },

  async getPricingLogs(productId?: string): Promise<PricingLog[]> {
    const query = productId ? `?product_id=${productId}` : '';
    const res = await fetch(`${API_BASE}/pricing/logs${query}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load pricing logs');
    return json.data;
  },

  // Forecasting
  async getForecasting(): Promise<{
    summary: { criticalCount: number; reorderNeededCount: number; avgDaysOfSupply: number };
    forecasts: ForecastItem[];
  }> {
    const res = await fetch(`${API_BASE}/forecasting`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load forecasting data');
    return json.data;
  },

  // Suppliers & POs
  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE}/suppliers`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load suppliers');
    return json.data;
  },

  async createSupplier(data: {
    supplier_name: string;
    contact_email: string;
    lead_time_days: number;
    reliability_rating: number;
    categories?: string[];
  }): Promise<Supplier> {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create supplier');
    return json.data;
  },

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const res = await fetch(`${API_BASE}/suppliers/orders`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load purchase orders');
    return json.data;
  },

  async createPurchaseOrder(data: {
    supplier_id: string;
    product_id: string;
    quantity: number;
  }): Promise<PurchaseOrder> {
    const res = await fetch(`${API_BASE}/suppliers/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create purchase order');
    return json.data;
  },

  async updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status']): Promise<PurchaseOrder> {
    const res = await fetch(`${API_BASE}/suppliers/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update PO status');
    return json.data;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load audit logs');
    return json.data;
  },

  async resetSeedData(): Promise<void> {
    const res = await fetch(`${API_BASE}/audit/reset-seed`, { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to reset seed data');
  }
};
