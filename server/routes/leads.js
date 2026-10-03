import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { clip } from '../config.js';
import { generateLeads } from '../services/gemini.js';
import { searchDemo } from '../data/demoLeads.js';
import { saveLeads } from '../store.js';

const router = Router();

router.post('/search', auth, async (req, res) => {
  const query = clip(req.body?.query, 120);
  if (!query) return res.status(400).json({ message: 'Enter a search' });

  const started = Date.now();
  let rows = null;
  let source = 'demo';

  try {
    rows = await generateLeads(query);
    if (rows?.length) source = 'gemini';
  } catch (e) {
    console.error('Gemini error:', e.message);
  }
  if (!rows?.length) {
    rows = searchDemo(query);
    source = 'demo';
  }

  const results = await saveLeads(req.user.id, query, source, rows);
  res.json({ results, source, query, tookMs: Date.now() - started });
});

export default router;
