import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const logs = await db.getAuditLogs();
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/reset-seed', async (_req, res) => {
  try {
    await db.resetSeedData();
    res.json({ success: true, message: 'Default seed data restored successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
