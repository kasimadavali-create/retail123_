import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const products = await db.getProducts();
    const suppliers = await db.getSuppliers();

    // Supplier lead times index by category
    const supplierMap = new Map<string, number>();
    suppliers.forEach(s => {
      s.categories?.forEach(cat => {
        if (!supplierMap.has(cat) || s.lead_time_days < supplierMap.get(cat)!) {
          supplierMap.set(cat, s.lead_time_days);
        }
      });
    });

    const forecasts = products.map(p => {
      const dailyVelocity = Math.max(0.1, p.avg_monthly_sales / 30);
      const leadTimeDays = supplierMap.get(p.category) || 10;

      // Days of supply remaining
      const daysUntilStockout = Math.round(p.stock_quantity / dailyVelocity);
      const depletionDate = new Date(Date.now() + daysUntilStockout * 86400000).toISOString();

      // Recommended Reorder Point (ROP) = (Lead Time * Daily Sales) + Safety Stock
      // Safety stock = 5 days of sales buffer
      const safetyStock = Math.ceil(dailyVelocity * 5);
      const reorderPoint = Math.ceil((leadTimeDays * dailyVelocity) + safetyStock);

      // Reorder Urgency
      let urgency: 'CRITICAL' | 'SOON' | 'HEALTHY' | 'SURPLUS' = 'HEALTHY';
      if (p.stock_quantity <= Math.ceil(leadTimeDays * dailyVelocity)) {
        urgency = 'CRITICAL'; // Will stock out before shipment arrives!
      } else if (p.stock_quantity <= reorderPoint) {
        urgency = 'SOON'; // Needs reorder trigger now
      } else if (p.stock_quantity > 200) {
        urgency = 'SURPLUS';
      }

      // Recommended Reorder Quantity (45 days of supply)
      const recommendedReorderQty = Math.max(20, Math.ceil(dailyVelocity * 45));

      // 30-Day Day-by-Day Forecast Trajectory
      const projectionPoints = [];
      let runningStock = p.stock_quantity;
      for (let day = 1; day <= 30; day += 3) {
        const consumed = dailyVelocity * 3;
        runningStock = Math.max(0, runningStock - consumed);
        projectionPoints.push({
          day: `Day ${day}`,
          projectedStock: Math.round(runningStock),
          projectedDemand: Math.round(dailyVelocity * day)
        });
      }

      return {
        product_id: p.id,
        sku: p.sku,
        product_name: p.product_name,
        category: p.category,
        current_stock: p.stock_quantity,
        daily_velocity: Math.round(dailyVelocity * 10) / 10,
        avg_monthly_sales: p.avg_monthly_sales,
        lead_time_days: leadTimeDays,
        days_until_stockout: daysUntilStockout,
        depletion_date: depletionDate,
        safety_stock: safetyStock,
        reorder_point: reorderPoint,
        recommended_reorder_qty: recommendedReorderQty,
        urgency,
        projections: projectionPoints
      };
    });

    // Summary insights
    const criticalStockouts = forecasts.filter(f => f.urgency === 'CRITICAL');
    const soonReorders = forecasts.filter(f => f.urgency === 'SOON');

    res.json({
      success: true,
      data: {
        summary: {
          criticalCount: criticalStockouts.length,
          reorderNeededCount: soonReorders.length,
          avgDaysOfSupply: Math.round(
            forecasts.reduce((sum, f) => sum + f.days_until_stockout, 0) / forecasts.length
          )
        },
        forecasts
      }
    });
  } catch (err: any) {
    console.error('Error in /api/forecasting:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
