import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';

const router = Router();

const CreateProductSchema = z.object({
  sku: z.string().min(3).max(50),
  product_name: z.string().min(2).max(255),
  category: z.enum(['Electronics', 'Apparel', 'Home & Kitchen', 'Health & Beauty', 'Sports & Outdoors']),
  stock_quantity: z.number().int().nonnegative(),
  unit_cost: z.number().positive(),
  retail_price: z.number().positive(),
  avg_monthly_sales: z.number().int().nonnegative()
});

const UpdateStockSchema = z.object({
  new_stock: z.number().int().nonnegative(),
  reason: z.string().min(2),
  change_type: z.enum(['RESTOCK', 'ADJUSTMENT', 'SALE', 'CYCLE_COUNT']).default('ADJUSTMENT'),
  location: z.string().optional()
});

const UpdatePriceSchema = z.object({
  retail_price: z.number().positive()
});

router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let products = await db.getProducts();

    if (category && typeof category === 'string' && category !== 'ALL') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.product_name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    // Enhance each product with calculated retail intelligence fields
    const enriched = products.map(p => {
      const marginDollar = p.retail_price - p.unit_cost;
      const marginPct = Math.round(((marginDollar / p.retail_price) * 100) * 10) / 10;
      const dailyVelocity = p.avg_monthly_sales / 30;
      const daysOfSupply = dailyVelocity > 0 ? Math.round(p.stock_quantity / dailyVelocity) : 999;

      let stockStatus: 'Critical Stock' | 'Low Stock' | 'Optimal' | 'Overstocked' = 'Optimal';
      if (p.stock_quantity < 5) stockStatus = 'Critical Stock';
      else if (p.stock_quantity < 15) stockStatus = 'Low Stock';
      else if (p.stock_quantity > 200) stockStatus = 'Overstocked';

      return {
        ...p,
        margin_dollar: Math.round(marginDollar * 100) / 100,
        margin_pct: marginPct,
        daily_velocity: Math.round(dailyVelocity * 10) / 10,
        days_of_supply: daysOfSupply,
        stock_status: stockStatus,
        inventory_valuation: Math.round(p.unit_cost * p.stock_quantity * 100) / 100,
        potential_revenue: Math.round(p.retail_price * p.stock_quantity * 100) / 100
      };
    });

    if (status && typeof status === 'string' && status !== 'ALL') {
      const filtered = enriched.filter(p => p.stock_status.toLowerCase() === status.toLowerCase());
      return res.json({ success: true, count: filtered.length, data: filtered });
    }

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const pricingLogs = await db.getPricingLogs(product.id);
    const auditLogs = (await db.getAuditLogs()).filter(a => a.product_id === product.id);

    const marginDollar = product.retail_price - product.unit_cost;
    const marginPct = Math.round(((marginDollar / product.retail_price) * 100) * 10) / 10;
    const dailyVelocity = product.avg_monthly_sales / 30;
    const daysOfSupply = dailyVelocity > 0 ? Math.round(product.stock_quantity / dailyVelocity) : 999;

    let stockStatus: 'Critical Stock' | 'Low Stock' | 'Optimal' | 'Overstocked' = 'Optimal';
    if (product.stock_quantity < 5) stockStatus = 'Critical Stock';
    else if (product.stock_quantity < 15) stockStatus = 'Low Stock';
    else if (product.stock_quantity > 200) stockStatus = 'Overstocked';

    res.json({
      success: true,
      data: {
        ...product,
        margin_dollar: Math.round(marginDollar * 100) / 100,
        margin_pct: marginPct,
        daily_velocity: Math.round(dailyVelocity * 10) / 10,
        days_of_supply: daysOfSupply,
        stock_status: stockStatus,
        inventory_valuation: Math.round(product.unit_cost * product.stock_quantity * 100) / 100,
        pricing_logs: pricingLogs,
        audit_logs: auditLogs
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const merchant = await db.getMerchant();
    const parsed = CreateProductSchema.parse(req.body);

    // Check SKU duplicate
    const existing = (await db.getProducts()).find(p => p.sku.toUpperCase() === parsed.sku.toUpperCase());
    if (existing) {
      return res.status(400).json({ success: false, error: `SKU '${parsed.sku}' already exists.` });
    }

    const newProd = await db.createProduct({
      ...parsed,
      sku: parsed.sku.toUpperCase(),
      merchant_id: merchant.id
    });

    res.status(201).json({ success: true, data: newProd });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id/stock', async (req, res) => {
  try {
    const parsed = UpdateStockSchema.parse(req.body);
    const updated = await db.updateStock(
      req.params.id,
      parsed.new_stock,
      parsed.reason,
      parsed.change_type,
      parsed.location || 'Main Warehouse'
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id/price', async (req, res) => {
  try {
    const parsed = UpdatePriceSchema.parse(req.body);
    const updated = await db.updateProductPrice(req.params.id, parsed.retail_price);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
