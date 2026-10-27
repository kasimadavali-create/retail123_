export type Category = 'Electronics' | 'Apparel' | 'Home & Kitchen' | 'Health & Beauty' | 'Sports & Outdoors';
export type StockStatus = 'Critical Stock' | 'Low Stock' | 'Optimal' | 'Overstocked';
export type PriceStrategy = 'Premium' | 'Competitive Match' | 'Clearance/Markdown' | 'High Margin';

export interface Product {
  id: string;
  merchant_id: string;
  sku: string;
  product_name: string;
  category: Category;
  stock_quantity: number;
  unit_cost: number;
  retail_price: number;
  avg_monthly_sales: number;
  created_at: string;
  margin_dollar: number;
  margin_pct: number;
  daily_velocity: number;
  days_of_supply: number;
  stock_status: StockStatus;
  inventory_valuation: number;
  potential_revenue: number;
}

export interface PricingLog {
  id: string;
  product_id: string;
  sku?: string;
  product_name?: string;
  current_price: number;
  competitor_price: number;
  recommended_price: number;
  projected_margin_pct: number;
  strategy_rationale: string;
  strategy_type?: PriceStrategy;
  demand_elasticity?: number;
  expected_sales_lift_pct?: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  supplier_name: string;
  contact_email: string;
  lead_time_days: number;
  reliability_rating: number;
  categories?: string[];
  min_order_qty?: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_cost: number;
  total_amount: number;
  status: 'DRAFT' | 'ORDERED' | 'IN_TRANSIT' | 'RECEIVED';
  expected_delivery: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  product_id: string;
  product_sku: string;
  product_name: string;
  change_type: 'INITIAL' | 'RESTOCK' | 'ADJUSTMENT' | 'SALE' | 'CYCLE_COUNT';
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  location: string;
  created_at: string;
}

export interface ForecastItem {
  product_id: string;
  sku: string;
  product_name: string;
  category: Category;
  current_stock: number;
  daily_velocity: number;
  avg_monthly_sales: number;
  lead_time_days: number;
  days_until_stockout: number;
  depletion_date: string;
  safety_stock: number;
  reorder_point: number;
  recommended_reorder_qty: number;
  urgency: 'CRITICAL' | 'SOON' | 'HEALTHY' | 'SURPLUS';
  projections: Array<{
    day: string;
    projectedStock: number;
    projectedDemand: number;
  }>;
}

export interface DashboardStats {
  totalProducts: number;
  totalUnitsInStock: number;
  totalInventoryCost: number;
  totalRetailValuation: number;
  projectedMonthlyRevenue: number;
  projectedMonthlyProfit: number;
  averageMarginPct: number;
  stockCounts: {
    critical: number;
    low: number;
    optimal: number;
    overstocked: number;
  };
  alerts: Array<{
    id: string;
    level: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    description: string;
    sku: string;
    actionUrl: string;
    productId: string;
  }>;
  fastMoving: Array<Product & { monthlyRevenue: number; stockTurnoverDays: number }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    stock: number;
    costValuation: number;
    retailValuation: number;
  }>;
  revenueTrajectory: Array<{
    month: string;
    revenue: number;
    cost: number;
    grossProfit: number;
    marginPct: number;
  }>;
  recentPricingOptimizationsCount: number;
  activePurchaseOrdersCount: number;
}
