import express from 'express';
import { getTasksAndComments } from '../services/tasksService.mjs';

const router = express.Router();

router.get('/tasks', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }

  try {
    const { tasks, comments } = await getTasksAndComments(token);
    return res.json({ tasks, comments });
  } catch (err) {
    console.error('Erro ao buscar tasks e comments:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
