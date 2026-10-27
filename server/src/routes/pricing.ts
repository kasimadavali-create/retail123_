import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import {
  PricingOptimizationInputSchema,
  optimizePriceWithGemini
} from '../services/geminiService.js';

const router = Router();

// Trigger AI Pricing Optimization
router.post('/optimize', async (req, res) => {
  try {
    const input = PricingOptimizationInputSchema.parse(req.body);
    const product = await db.getProductById(input.product_id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Call Gemini AI service
    const optimization = await optimizePriceWithGemini(
      product,
      input.competitor_price,
      input.target_strategy,
      input.custom_gemini_key
    );

    // Save result to pricing_logs table
    const logged = await db.addPricingLog({
      product_id: product.id,
      sku: product.sku,
      product_name: product.product_name,
      current_price: product.retail_price,
      competitor_price: input.competitor_price,
      recommended_price: optimization.recommended_price,
      projected_margin_pct: optimization.projected_margin_pct,
      strategy_rationale: optimization.strategy_rationale,
      strategy_type: optimization.strategy_type,
      demand_elasticity: optimization.demand_elasticity,
      expected_sales_lift_pct: optimization.expected_sales_lift_pct
    });

    res.json({
      success: true,
      data: {
        log_id: logged.id,
        product,
        optimization
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    console.error('Error in /api/pricing/optimize:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Pricing Logs History
router.get('/logs', async (req, res) => {
  try {
    const { product_id } = req.query;
    const logs = await db.getPricingLogs(typeof product_id === 'string' ? product_id : undefined);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Apply Recommended Price to Live Product
const ApplyPriceSchema = z.object({
  product_id: z.string(),
  new_price: z.number().positive(),
  log_id: z.string().optional()
});

router.post('/apply', async (req, res) => {
  try {
    const { product_id, new_price } = ApplyPriceSchema.parse(req.body);
    const updated = await db.updateProductPrice(product_id, new_price);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({
      success: true,
      message: `Price successfully applied: $${new_price.toFixed(2)}`,
      data: updated
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
