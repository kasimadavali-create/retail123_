export interface Merchant {
  id: string;
  store_name: string;
  email: string;
  currency: string;
  created_at: string;
}

export interface Product {
  id: string;
  merchant_id: string;
  sku: string;
  product_name: string;
  category: 'Electronics' | 'Apparel' | 'Home & Kitchen' | 'Health & Beauty' | 'Sports & Outdoors';
  stock_quantity: number;
  unit_cost: number;
  retail_price: number;
  avg_monthly_sales: number;
  created_at: string;
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
  strategy_type?: 'Premium' | 'Competitive Match' | 'Clearance/Markdown' | 'High Margin';
  demand_elasticity?: number;
  expected_sales_lift_pct?: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  supplier_name: string;
  contact_email: string;
  lead_time_days: number;
  reliability_rating: number; // e.g. 4.85
  categories?: string[];
  min_order_qty?: number;
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

export const DEFAULT_MERCHANT: Merchant = {
  id: "d8b52f6c-8431-419b-a01c-373e3a479001",
  store_name: "Apex Global Retail & Commerce",
  email: "operations@apexretail.io",
  currency: "USD",
  created_at: new Date(Date.now() - 90 * 86400000).toISOString()
};

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-001",
    supplier_name: "Shenzhen Precision Audio & Tech Ltd",
    contact_email: "orders@precisionaudio.tech",
    lead_time_days: 12,
    reliability_rating: 4.85,
    categories: ["Electronics"],
    min_order_qty: 20
  },
  {
    id: "sup-002",
    supplier_name: "EcoFabrics Apparel Collective",
    contact_email: "wholesale@ecofabrics.co",
    lead_time_days: 8,
    reliability_rating: 4.70,
    categories: ["Apparel"],
    min_order_qty: 25
  },
  {
    id: "sup-003",
    supplier_name: "Solingen Kitchenware & Metals",
    contact_email: "supply@solingenkitchen.de",
    lead_time_days: 15,
    reliability_rating: 4.92,
    categories: ["Home & Kitchen"],
    min_order_qty: 10
  },
  {
    id: "sup-004",
    supplier_name: "DermaBotanics Labs Inc.",
    contact_email: "fulfillment@dermabotanics.com",
    lead_time_days: 6,
    reliability_rating: 4.95,
    categories: ["Health & Beauty"],
    min_order_qty: 50
  },
  {
    id: "sup-005",
    supplier_name: "ActivePeak Gear Manufactory",
    contact_email: "orders@activepeakgear.com",
    lead_time_days: 10,
    reliability_rating: 4.65,
    categories: ["Sports & Outdoors"],
    min_order_qty: 30
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-401",
    merchant_id: DEFAULT_MERCHANT.id,
    sku: "ELE-401",
    product_name: "Wireless Noise-Canceling Headphones",
    category: "Electronics",
    stock_quantity: 24, // Optimal / Moderate
    unit_cost: 65.00,
    retail_price: 149.99,
    avg_monthly_sales: 45,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: "prod-102",
    merchant_id: DEFAULT_MERCHANT.id,
    sku: "APP-102",
    product_name: "Organic Cotton Hooded Sweatshirt",
    category: "Apparel",
    stock_quantity: 8, // Low Stock (< 15 units)
    unit_cost: 18.50,
    retail_price: 49.99,
    avg_monthly_sales: 60,
    created_at: new Date(Date.now() - 50 * 86400000).toISOString()
  },
  {
    id: "prod-305",
    merchant_id: DEFAULT_MERCHANT.id,
    sku: "HOM-305",
    product_name: "Stainless Steel Smart Coffee Maker",
    category: "Home & Kitchen",
    stock_quantity: 12, // Low Stock (< 15 units)
    unit_cost: 42.00,
    retail_price: 119.00,
    avg_monthly_sales: 25,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    id: "prod-204",
    merchant_id: DEFAULT_MERCHANT.id,
    sku: "BEA-204",
    product_name: "Vitamin C Facial Serum (30ml)",
    category: "Health & Beauty",
    stock_quantity: 115, // Optimal
    unit_cost: 8.00,
    retail_price: 29.99,
    avg_monthly_sales: 90,
    created_at: new Date(Date.now() - 35 * 86400000).toISOString()
  },
  {
    id: "prod-509",
    merchant_id: DEFAULT_MERCHANT.id,
    sku: "SPO-509",
    product_name: "Adjustable Resistance Fitness Bands",
    category: "Sports & Outdoors",
    stock_quantity: 4, // Critical Stock (< 5 units)
    unit_cost: 6.00,
    retail_price: 24.99,
    avg_monthly_sales: 50,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: "prod-771",
    merchant_id: DEFAULT_MERCHANT.id,
    sku: "ELE-771",
    product_name: "Ultra-Fast 65W GaN Travel Charger",
    category: "Electronics",
    stock_quantity: 215, // Overstocked (> 200 units)
    unit_cost: 12.00,
    retail_price: 34.99,
    avg_monthly_sales: 30,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: "prod-892",
    merchant_id: DEFAULT_MERCHANT.id,
    sku: "HOM-892",
    product_name: "Cast Iron Dutch Oven 6-Quart",
    category: "Home & Kitchen",
    stock_quantity: 18,
    unit_cost: 38.00,
    retail_price: 89.95,
    avg_monthly_sales: 22,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: "prod-310",
    merchant_id: DEFAULT_MERCHANT.id,
    sku: "SPO-310",
    product_name: "Insulated Stainless Steel Hydration Bottle 32oz",
    category: "Sports & Outdoors",
    stock_quantity: 3, // Critical Stock
    unit_cost: 9.50,
    retail_price: 32.00,
    avg_monthly_sales: 42,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  }
];

export const INITIAL_PRICING_LOGS: PricingLog[] = [
  {
    id: "log-001",
    product_id: "prod-401",
    sku: "ELE-401",
    product_name: "Wireless Noise-Canceling Headphones",
    current_price: 149.99,
    competitor_price: 139.99,
    recommended_price: 144.50,
    projected_margin_pct: 55.02,
    strategy_rationale: "Competitors discounted by $10. Recommendation retains premium ANC acoustic positioning while capturing price-sensitive audio shoppers without margin dilution.",
    strategy_type: "Competitive Match",
    demand_elasticity: 1.4,
    expected_sales_lift_pct: 18.5,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: "log-002",
    product_id: "prod-771",
    sku: "ELE-771",
    product_name: "Ultra-Fast 65W GaN Travel Charger",
    current_price: 34.99,
    competitor_price: 29.99,
    recommended_price: 27.99,
    projected_margin_pct: 57.12,
    strategy_rationale: "Inventory is overstocked at 215 units with 30 units/month velocity. Aggressive temporary flash promo recommended to free up working capital and prevent warehouse holding penalties.",
    strategy_type: "Clearance/Markdown",
    demand_elasticity: 2.1,
    expected_sales_lift_pct: 45.0,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "audit-001",
    product_id: "prod-509",
    product_sku: "SPO-509",
    product_name: "Adjustable Resistance Fitness Bands",
    change_type: "SALE",
    quantity_change: -6,
    previous_stock: 10,
    new_stock: 4,
    reason: "E-Commerce multi-order fulfillment batch #4881",
    location: "Main Warehouse - Bay D-04",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: "audit-002",
    product_id: "prod-102",
    product_sku: "APP-102",
    product_name: "Organic Cotton Hooded Sweatshirt",
    change_type: "CYCLE_COUNT",
    quantity_change: -2,
    previous_stock: 10,
    new_stock: 8,
    reason: "Quarterly physical warehouse inventory reconciliation",
    location: "Main Warehouse - Rack B-12",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "audit-003",
    product_id: "prod-204",
    product_sku: "BEA-204",
    product_name: "Vitamin C Facial Serum (30ml)",
    change_type: "RESTOCK",
    quantity_change: 60,
    previous_stock: 55,
    new_stock: 115,
    reason: "Vendor PO-2026-004 incoming freight delivery accepted",
    location: "Cold Storage Room C",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-001",
    po_number: "PO-2026-081",
    supplier_id: "sup-005",
    supplier_name: "ActivePeak Gear Manufactory",
    product_id: "prod-509",
    product_name: "Adjustable Resistance Fitness Bands",
    sku: "SPO-509",
    quantity: 100,
    unit_cost: 6.00,
    total_amount: 600.00,
    status: "ORDERED",
    expected_delivery: new Date(Date.now() + 8 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "po-002",
    po_number: "PO-2026-082",
    supplier_id: "sup-002",
    supplier_name: "EcoFabrics Apparel Collective",
    product_id: "prod-102",
    product_name: "Organic Cotton Hooded Sweatshirt",
    sku: "APP-102",
    quantity: 50,
    unit_cost: 18.50,
    total_amount: 925.00,
    status: "IN_TRANSIT",
    expected_delivery: new Date(Date.now() + 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  }
];
