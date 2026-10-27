import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/stats', async (_req, res) => {
  try {
    const products = await db.getProducts();
    const suppliers = await db.getSuppliers();
    const pricingLogs = await db.getPricingLogs();
    const purchaseOrders = await db.getPurchaseOrders();

    // Inventory Valuation & Metrics
    const totalInventoryCost = products.reduce((sum, p) => sum + (p.unit_cost * p.stock_quantity), 0);
    const totalRetailValuation = products.reduce((sum, p) => sum + (p.retail_price * p.stock_quantity), 0);
    const totalUnitsInStock = products.reduce((sum, p) => sum + p.stock_quantity, 0);
    const projectedMonthlyRevenue = products.reduce((sum, p) => sum + (p.retail_price * p.avg_monthly_sales), 0);
    const projectedMonthlyCost = products.reduce((sum, p) => sum + (p.unit_cost * p.avg_monthly_sales), 0);
    const projectedMonthlyProfit = projectedMonthlyRevenue - projectedMonthlyCost;
    const averageMarginPct = projectedMonthlyRevenue > 0
      ? ((projectedMonthlyProfit / projectedMonthlyRevenue) * 100)
      : 0;

    // Stock Categorization
    const criticalStock = products.filter(p => p.stock_quantity < 5);
    const lowStock = products.filter(p => p.stock_quantity >= 5 && p.stock_quantity < 15);
    const optimalStock = products.filter(p => p.stock_quantity >= 15 && p.stock_quantity <= 200);
    const overstocked = products.filter(p => p.stock_quantity > 200);

    // Urgent Action Alerts
    const alerts: Array<{
      id: string;
      level: 'CRITICAL' | 'WARNING' | 'INFO';
      title: string;
      description: string;
      sku: string;
      actionUrl: string;
      productId: string;
    }> = [];

    criticalStock.forEach(p => {
      const daysLeft = Math.max(1, Math.round((p.stock_quantity / (p.avg_monthly_sales / 30))));
      alerts.push({
        id: `crit-${p.id}`,
        level: 'CRITICAL',
        title: `Critical Stockout Imminent: ${p.sku}`,
        description: `${p.product_name} has only ${p.stock_quantity} units remaining (~${daysLeft} days of run rate). Restock immediately!`,
        sku: p.sku,
        actionUrl: '/suppliers',
        productId: p.id
      });
    });

    lowStock.forEach(p => {
      alerts.push({
        id: `low-${p.id}`,
        level: 'WARNING',
        title: `Low Stock Reorder Buffer: ${p.sku}`,
        description: `${p.product_name} is down to ${p.stock_quantity} units. Review supplier lead times.`,
        sku: p.sku,
        actionUrl: '/forecasting',
        productId: p.id
      });
    });

    overstocked.forEach(p => {
      const lockedCapital = (p.stock_quantity * p.unit_cost).toFixed(2);
      alerts.push({
        id: `over-${p.id}`,
        level: 'INFO',
        title: `Surplus Overstock Detected: ${p.sku}`,
        description: `${p.product_name} has ${p.stock_quantity} units ($${lockedCapital} capital tied up). Trigger AI markdown optimization.`,
        sku: p.sku,
        actionUrl: '/pricing-ai',
        productId: p.id
      });
    });

    // Fast-Moving Products
    const fastMoving = [...products]
      .sort((a, b) => b.avg_monthly_sales - a.avg_monthly_sales)
      .slice(0, 5)
      .map(p => ({
        ...p,
        monthlyRevenue: Math.round(p.retail_price * p.avg_monthly_sales),
        stockTurnoverDays: Math.round((p.stock_quantity / (p.avg_monthly_sales / 30)) || 0)
      }));

    // Category Distribution
    const categoryMap: Record<string, { count: number; stock: number; costValuation: number; retailValuation: number }> = {};
    products.forEach(p => {
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { count: 0, stock: 0, costValuation: 0, retailValuation: 0 };
      }
      categoryMap[p.category].count += 1;
      categoryMap[p.category].stock += p.stock_quantity;
      categoryMap[p.category].costValuation += p.unit_cost * p.stock_quantity;
      categoryMap[p.category].retailValuation += p.retail_price * p.stock_quantity;
    });

    const categoryDistribution = Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      ...stats
    }));

    // Simulated 6-Month Revenue & Margin Trajectory
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const revenueTrajectory = months.map((month, i) => {
      const variance = 1 + ((i - 2) * 0.06);
      const rev = Math.round(projectedMonthlyRevenue * variance);
      const cost = Math.round(projectedMonthlyCost * variance);
      return {
        month,
        revenue: rev,
        cost: cost,
        grossProfit: rev - cost,
        marginPct: Math.round(((rev - cost) / rev) * 100)
      };
    });

    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        totalUnitsInStock,
        totalInventoryCost: Math.round(totalInventoryCost * 100) / 100,
        totalRetailValuation: Math.round(totalRetailValuation * 100) / 100,
        projectedMonthlyRevenue: Math.round(projectedMonthlyRevenue * 100) / 100,
        projectedMonthlyProfit: Math.round(projectedMonthlyProfit * 100) / 100,
        averageMarginPct: Math.round(averageMarginPct * 10) / 10,
        stockCounts: {
          critical: criticalStock.length,
          low: lowStock.length,
          optimal: optimalStock.length,
          overstocked: overstocked.length
        },
        alerts,
        fastMoving,
        categoryDistribution,
        revenueTrajectory,
        recentPricingOptimizationsCount: pricingLogs.length,
        activePurchaseOrdersCount: purchaseOrders.filter(po => po.status !== 'RECEIVED').length
      }
    });
  } catch (err: any) {
    console.error('Error in /api/dashboard/stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
