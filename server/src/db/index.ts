import pg from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  DEFAULT_MERCHANT,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_PRICING_LOGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PURCHASE_ORDERS,
  Product,
  Merchant,
  Supplier,
  PricingLog,
  AuditLog,
  PurchaseOrder
} from './seedData.js';

interface DatabaseStore {
  merchants: Merchant[];
  products: Product[];
  suppliers: Supplier[];
  pricing_logs: PricingLog[];
  audit_logs: AuditLog[];
  purchase_orders: PurchaseOrder[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'retailpulse_store.json');

class DatabaseService {
  private pgPool: pg.Pool | null = null;
  private isPostgres = false;
  private memoryStore: DatabaseStore = {
    merchants: [DEFAULT_MERCHANT],
    products: [...INITIAL_PRODUCTS],
    suppliers: [...INITIAL_SUPPLIERS],
    pricing_logs: [...INITIAL_PRICING_LOGS],
    audit_logs: [...INITIAL_AUDIT_LOGS],
    purchase_orders: [...INITIAL_PURCHASE_ORDERS]
  };

  constructor() {
    this.init();
  }

  private async init() {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      try {
        console.log('[DB] Connecting to PostgreSQL database...');
        this.pgPool = new pg.Pool({
          connectionString: dbUrl,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
        });

        // Test connection
        await this.pgPool.query('SELECT NOW()');
        this.isPostgres = true;
        console.log('[DB] Successfully connected to PostgreSQL.');
        await this.initPostgresSchema();
        return;
      } catch (err) {
        console.warn('[DB] PostgreSQL connection failed. Falling back to local persistent store.', err);
        this.isPostgres = false;
      }
    }

    // Local file-based fallback
    this.initLocalStore();
  }

  private initLocalStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.memoryStore = {
          merchants: parsed.merchants?.length ? parsed.merchants : [DEFAULT_MERCHANT],
          products: parsed.products?.length ? parsed.products : [...INITIAL_PRODUCTS],
          suppliers: parsed.suppliers?.length ? parsed.suppliers : [...INITIAL_SUPPLIERS],
          pricing_logs: parsed.pricing_logs?.length ? parsed.pricing_logs : [...INITIAL_PRICING_LOGS],
          audit_logs: parsed.audit_logs?.length ? parsed.audit_logs : [...INITIAL_AUDIT_LOGS],
          purchase_orders: parsed.purchase_orders?.length ? parsed.purchase_orders : [...INITIAL_PURCHASE_ORDERS]
        };
        console.log(`[DB] Loaded persistent local store with ${this.memoryStore.products.length} products.`);
      } else {
        this.saveLocalStore();
        console.log(`[DB] Created initial local persistent store at ${STORE_FILE}`);
      }
    } catch (err) {
      console.error('[DB] Error initializing local store:', err);
    }
  }

  private saveLocalStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.memoryStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save local store:', err);
    }
  }

  private async initPostgresSchema() {
    if (!this.pgPool) return;
    try {
      const schemaSqlPath = path.resolve(__dirname, 'schema.sql');
      if (fs.existsSync(schemaSqlPath)) {
        const sql = fs.readFileSync(schemaSqlPath, 'utf-8');
        await this.pgPool.query(sql);
      }

      // Check if products exist, otherwise seed
      const res = await this.pgPool.query('SELECT COUNT(*) FROM products');
      if (parseInt(res.rows[0].count, 10) === 0) {
        console.log('[DB] Seeding PostgreSQL database...');
        await this.pgPool.query(
          `INSERT INTO merchants (id, store_name, email, currency) 
           VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
          [DEFAULT_MERCHANT.id, DEFAULT_MERCHANT.store_name, DEFAULT_MERCHANT.email, DEFAULT_MERCHANT.currency]
        );

        for (const p of INITIAL_PRODUCTS) {
          await this.pgPool.query(
            `INSERT INTO products (id, merchant_id, sku, product_name, category, stock_quantity, unit_cost, retail_price, avg_monthly_sales)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (sku) DO NOTHING`,
            [crypto.randomUUID(), DEFAULT_MERCHANT.id, p.sku, p.product_name, p.category, p.stock_quantity, p.unit_cost, p.retail_price, p.avg_monthly_sales]
          );
        }

        for (const s of INITIAL_SUPPLIERS) {
          await this.pgPool.query(
            `INSERT INTO suppliers (id, supplier_name, contact_email, lead_time_days, reliability_rating)
             VALUES ($1, $2, $3, $4, $5)`,
            [crypto.randomUUID(), s.supplier_name, s.contact_email, s.lead_time_days, s.reliability_rating]
          );
        }
        console.log('[DB] PostgreSQL seed completed successfully.');
      }
    } catch (err) {
      console.error('[DB] Error initializing PostgreSQL schema:', err);
    }
  }

  public isUsingPostgres(): boolean {
    return this.isPostgres;
  }

  // --- Products CRUD ---
  public async getProducts(): Promise<Product[]> {
    if (this.isPostgres && this.pgPool) {
      const res = await this.pgPool.query('SELECT * FROM products ORDER BY created_at DESC');
      return res.rows.map(r => ({
        ...r,
        unit_cost: parseFloat(r.unit_cost),
        retail_price: parseFloat(r.retail_price),
        stock_quantity: parseInt(r.stock_quantity, 10),
        avg_monthly_sales: parseInt(r.avg_monthly_sales, 10)
      }));
    }
    return [...this.memoryStore.products];
  }

  public async getProductById(id: string): Promise<Product | null> {
    if (this.isPostgres && this.pgPool) {
      const res = await this.pgPool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        ...r,
        unit_cost: parseFloat(r.unit_cost),
        retail_price: parseFloat(r.retail_price),
        stock_quantity: parseInt(r.stock_quantity, 10),
        avg_monthly_sales: parseInt(r.avg_monthly_sales, 10)
      };
    }
    return this.memoryStore.products.find(p => p.id === id) || null;
  }

  public async createProduct(data: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newProduct: Product = {
      id,
      created_at,
      ...data,
      stock_quantity: Number(data.stock_quantity),
      unit_cost: Number(data.unit_cost),
      retail_price: Number(data.retail_price),
      avg_monthly_sales: Number(data.avg_monthly_sales)
    };

    if (this.isPostgres && this.pgPool) {
      await this.pgPool.query(
        `INSERT INTO products (id, merchant_id, sku, product_name, category, stock_quantity, unit_cost, retail_price, avg_monthly_sales, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, newProduct.merchant_id, newProduct.sku, newProduct.product_name, newProduct.category, newProduct.stock_quantity, newProduct.unit_cost, newProduct.retail_price, newProduct.avg_monthly_sales, created_at]
      );
    } else {
      this.memoryStore.products.unshift(newProduct);
      this.saveLocalStore();
    }

    // Add initial audit log
    await this.addAuditLog({
      product_id: id,
      product_sku: newProduct.sku,
      product_name: newProduct.product_name,
      change_type: 'INITIAL',
      quantity_change: newProduct.stock_quantity,
      previous_stock: 0,
      new_stock: newProduct.stock_quantity,
      reason: 'Product onboarding & initial catalog intake',
      location: 'Main Warehouse - Inbound Receiving'
    });

    return newProduct;
  }

  public async updateStock(
    id: string,
    newQuantity: number,
    reason: string,
    changeType: 'RESTOCK' | 'ADJUSTMENT' | 'SALE' | 'CYCLE_COUNT' = 'ADJUSTMENT',
    location = 'Main Warehouse'
  ): Promise<Product | null> {
    const product = await this.getProductById(id);
    if (!product) return null;

    const previousStock = product.stock_quantity;
    const qtyChange = newQuantity - previousStock;
    product.stock_quantity = Math.max(0, newQuantity);

    if (this.isPostgres && this.pgPool) {
      await this.pgPool.query('UPDATE products SET stock_quantity = $1 WHERE id = $2', [product.stock_quantity, id]);
    } else {
      const idx = this.memoryStore.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.memoryStore.products[idx] = product;
        this.saveLocalStore();
      }
    }

    // Record audit log
    await this.addAuditLog({
      product_id: product.id,
      product_sku: product.sku,
      product_name: product.product_name,
      change_type: changeType,
      quantity_change: qtyChange,
      previous_stock: previousStock,
      new_stock: product.stock_quantity,
      reason: reason || `Manual stock adjustment of ${qtyChange >= 0 ? '+' : ''}${qtyChange} units`,
      location
    });

    return product;
  }

  public async updateProductPrice(id: string, newPrice: number): Promise<Product | null> {
    const product = await this.getProductById(id);
    if (!product) return null;

    product.retail_price = newPrice;

    if (this.isPostgres && this.pgPool) {
      await this.pgPool.query('UPDATE products SET retail_price = $1 WHERE id = $2', [newPrice, id]);
    } else {
      const idx = this.memoryStore.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.memoryStore.products[idx].retail_price = newPrice;
        this.saveLocalStore();
      }
    }

    return product;
  }

  // --- Pricing Logs ---
  public async getPricingLogs(productId?: string): Promise<PricingLog[]> {
    if (this.isPostgres && this.pgPool) {
      let query = `
        SELECT pl.*, p.sku, p.product_name 
        FROM pricing_logs pl
        LEFT JOIN products p ON pl.product_id = p.id
      `;
      const params: any[] = [];
      if (productId) {
        query += ' WHERE pl.product_id = $1';
        params.push(productId);
      }
      query += ' ORDER BY pl.created_at DESC LIMIT 50';
      const res = await this.pgPool.query(query, params);
      return res.rows.map(r => ({
        ...r,
        current_price: parseFloat(r.current_price),
        competitor_price: parseFloat(r.competitor_price),
        recommended_price: parseFloat(r.recommended_price),
        projected_margin_pct: parseFloat(r.projected_margin_pct)
      }));
    }

    let logs = this.memoryStore.pricing_logs;
    if (productId) {
      logs = logs.filter(l => l.product_id === productId);
    }
    return [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async addPricingLog(log: Omit<PricingLog, 'id' | 'created_at'>): Promise<PricingLog> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newLog: PricingLog = {
      id,
      created_at,
      ...log
    };

    if (this.isPostgres && this.pgPool) {
      await this.pgPool.query(
        `INSERT INTO pricing_logs (id, product_id, current_price, competitor_price, recommended_price, projected_margin_pct, strategy_rationale, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, newLog.product_id, newLog.current_price, newLog.competitor_price, newLog.recommended_price, newLog.projected_margin_pct, newLog.strategy_rationale, created_at]
      );
    } else {
      this.memoryStore.pricing_logs.unshift(newLog);
      this.saveLocalStore();
    }

    return newLog;
  }

  // --- Suppliers ---
  public async getSuppliers(): Promise<Supplier[]> {
    if (this.isPostgres && this.pgPool) {
      const res = await this.pgPool.query('SELECT * FROM suppliers ORDER BY reliability_rating DESC');
      return res.rows.map(r => ({
        ...r,
        lead_time_days: parseInt(r.lead_time_days, 10),
        reliability_rating: parseFloat(r.reliability_rating)
      }));
    }
    return [...this.memoryStore.suppliers];
  }

  public async createSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    const newSupplier: Supplier = {
      id: crypto.randomUUID(),
      ...supplier
    };

    if (this.isPostgres && this.pgPool) {
      await this.pgPool.query(
        `INSERT INTO suppliers (id, supplier_name, contact_email, lead_time_days, reliability_rating)
         VALUES ($1, $2, $3, $4, $5)`,
        [newSupplier.id, newSupplier.supplier_name, newSupplier.contact_email, newSupplier.lead_time_days, newSupplier.reliability_rating]
      );
    } else {
      this.memoryStore.suppliers.push(newSupplier);
      this.saveLocalStore();
    }

    return newSupplier;
  }

  // --- Purchase Orders ---
  public async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    if (this.isPostgres && this.pgPool) {
      const res = await this.pgPool.query('SELECT * FROM purchase_orders ORDER BY created_at DESC');
      return res.rows.map(r => ({
        ...r,
        quantity: parseInt(r.quantity, 10),
        unit_cost: parseFloat(r.unit_cost),
        total_amount: parseFloat(r.total_amount)
      }));
    }
    return [...this.memoryStore.purchase_orders];
  }

  public async createPurchaseOrder(data: {
    supplier_id: string;
    product_id: string;
    quantity: number;
  }): Promise<PurchaseOrder> {
    const product = await this.getProductById(data.product_id);
    const suppliers = await this.getSuppliers();
    const supplier = suppliers.find(s => s.id === data.supplier_id);

    if (!product) throw new Error('Product not found');
    const supplierName = supplier?.supplier_name || 'Preferred Vendor';
    const leadDays = supplier?.lead_time_days || 10;

    const id = crypto.randomUUID();
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const unitCost = product.unit_cost;
    const totalAmount = unitCost * data.quantity;
    const expectedDelivery = new Date(Date.now() + leadDays * 86400000).toISOString();
    const createdAt = new Date().toISOString();

    const po: PurchaseOrder = {
      id,
      po_number: poNumber,
      supplier_id: data.supplier_id,
      supplier_name: supplierName,
      product_id: product.id,
      product_name: product.product_name,
      sku: product.sku,
      quantity: data.quantity,
      unit_cost: unitCost,
      total_amount: totalAmount,
      status: 'ORDERED',
      expected_delivery: expectedDelivery,
      created_at: createdAt
    };

    if (this.isPostgres && this.pgPool) {
      await this.pgPool.query(
        `INSERT INTO purchase_orders (id, po_number, supplier_id, supplier_name, product_id, product_name, quantity, unit_cost, total_amount, status, expected_delivery, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [id, po.po_number, po.supplier_id, po.supplier_name, po.product_id, po.product_name, po.quantity, po.unit_cost, po.total_amount, po.status, po.expected_delivery, po.created_at]
      );
    } else {
      this.memoryStore.purchase_orders.unshift(po);
      this.saveLocalStore();
    }

    return po;
  }

  public async updatePOStatus(id: string, status: PurchaseOrder['status']): Promise<PurchaseOrder | null> {
    const orders = await this.getPurchaseOrders();
    const po = orders.find(o => o.id === id);
    if (!po) return null;

    po.status = status;

    if (this.isPostgres && this.pgPool) {
      await this.pgPool.query('UPDATE purchase_orders SET status = $1 WHERE id = $2', [status, id]);
    } else {
      const idx = this.memoryStore.purchase_orders.findIndex(o => o.id === id);
      if (idx !== -1) {
        this.memoryStore.purchase_orders[idx].status = status;
        this.saveLocalStore();
      }
    }

    // If marked received, restock product!
    if (status === 'RECEIVED') {
      await this.updateStock(
        po.product_id,
        (await this.getProductById(po.product_id))?.stock_quantity! + po.quantity,
        `PO Fulfillment received (${po.po_number})`,
        'RESTOCK'
      );
    }

    return po;
  }

  // --- Audit Logs ---
  public async getAuditLogs(): Promise<AuditLog[]> {
    if (this.isPostgres && this.pgPool) {
      const res = await this.pgPool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
      return res.rows.map(r => ({
        ...r,
        quantity_change: parseInt(r.quantity_change, 10),
        previous_stock: parseInt(r.previous_stock, 10),
        new_stock: parseInt(r.new_stock, 10)
      }));
    }
    return [...this.memoryStore.audit_logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const newLog: AuditLog = {
      id,
      created_at,
      ...log
    };

    if (this.isPostgres && this.pgPool) {
      await this.pgPool.query(
        `INSERT INTO audit_logs (id, product_id, product_sku, product_name, change_type, quantity_change, previous_stock, new_stock, reason, location, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [id, newLog.product_id, newLog.product_sku, newLog.product_name, newLog.change_type, newLog.quantity_change, newLog.previous_stock, newLog.new_stock, newLog.reason, newLog.location, created_at]
      );
    } else {
      this.memoryStore.audit_logs.unshift(newLog);
      this.saveLocalStore();
    }

    return newLog;
  }

  public async getMerchant(): Promise<Merchant> {
    return DEFAULT_MERCHANT;
  }

  public async resetSeedData(): Promise<void> {
    this.memoryStore = {
      merchants: [DEFAULT_MERCHANT],
      products: [...INITIAL_PRODUCTS],
      suppliers: [...INITIAL_SUPPLIERS],
      pricing_logs: [...INITIAL_PRICING_LOGS],
      audit_logs: [...INITIAL_AUDIT_LOGS],
      purchase_orders: [...INITIAL_PURCHASE_ORDERS]
    };
    this.saveLocalStore();
  }
}

export const db = new DatabaseService();
