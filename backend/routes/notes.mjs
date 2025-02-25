import express from 'express';
import { getNotes } from '../services/notesService.mjs';

const router = express.Router();

router.get('/notes', async (req, res) => {
  try {
    const notes = await getNotes();
    return res.json({ notes });
  } catch (err) {
    console.error('Erro ao buscar notas:', err);
    return res.status(500).json({ error: 'Erro interno do servidor ao buscar notas' });
  }
});

export default router;
