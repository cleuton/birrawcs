import express from 'express';
import { getSummary } from '../services/summaryService.mjs';

const router = express.Router();

router.get('/summary', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }

  try {
    const summary = await getSummary(token);
    return res.json({ summary });
  } catch (err) {
    console.error('Erro ao obter resumo:', err);
    return res.status(401).json({ error: err.message });
  }
});

export default router;
