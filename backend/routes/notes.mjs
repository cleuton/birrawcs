import express from 'express';
import { getDB } from '../db.mjs';

const router = express.Router();

router.get('/notes', async (req, res) => {
  try {
    const db = getDB();
    const notesCollection = db.collection('notes');
    const notes = await notesCollection.find({}).sort({ datePosted: -1 }).toArray();
    return res.json({ notes });
  } catch (err) {
    console.error('Erro ao buscar notas:', err);
    return res.status(500).json({ error: 'Erro interno do servidor ao buscar notas' });
  }
});

export default router;
