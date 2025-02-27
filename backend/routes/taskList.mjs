// routes/taskListRoutes.mjs
import express from 'express';
import { getTasks } from '../services/tasksListService.mjs';

const router = express.Router();

router.get('/tasklist', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }

  const { status = "working", page = 1, pageSize = 10 } = req.query;

  try {
    const tasks = await getTasks(token, status, page, pageSize);
    return res.json({ tasks });
  } catch (err) {
    console.error('Erro ao buscar tasks:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;