import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';

const router = Router();

const CreateSupplierSchema = z.object({
  supplier_name: z.string().min(2),
  contact_email: z.string().email(),
  lead_time_days: z.number().int().positive(),
  reliability_rating: z.number().min(1).max(5),
  categories: z.array(z.string()).optional()
});

const CreatePOSchema = z.object({
  supplier_id: z.string(),
  product_id: z.string(),
  quantity: z.number().int().positive()
});

const UpdatePOStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ORDERED', 'IN_TRANSIT', 'RECEIVED'])
});

router.get('/', async (_req, res) => {
  try {
    const suppliers = await db.getSuppliers();
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const parsed = CreateSupplierSchema.parse(req.body);
    const supplier = await db.createSupplier(parsed);
    res.status(201).json({ success: true, data: supplier });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/orders', async (_req, res) => {
  try {
    const orders = await db.getPurchaseOrders();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const parsed = CreatePOSchema.parse(req.body);
    const po = await db.createPurchaseOrder(parsed);
    res.status(201).json({ success: true, data: po });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const parsed = UpdatePOStatusSchema.parse(req.body);
    const updated = await db.updatePOStatus(req.params.id, parsed.status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
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
