import express from 'express';
import jwt from 'jsonwebtoken';
import { Binary } from 'mongodb';
import { getDB } from '../db.mjs';

const router = express.Router();

router.get('/summary', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }

  try {
    const decoded = jwt.verify(token, 'seu_segredo_super_secreto');
    const userIdString = decoded.id;
    const userIdBuffer = Buffer.from(userIdString.replace(/-/g, ''), 'hex');
    const binaryUserId = new Binary(userIdBuffer, Binary.SUBTYPE_UUID);
    
    const db = getDB();
    const tasksCollection = db.collection('tasks');

    const pipeline = [
      { $match: { owner: binaryUserId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ];

    const results = await tasksCollection.aggregate(pipeline).toArray();

    const summary = {
      pending: 0,
      working: 0,
      completed: 0,
      suspended: 0
    };

    results.forEach(item => {
      summary[item._id] = item.count;
    });

    return res.json({ summary });
  } catch (err) {
    console.error('Erro ao obter resumo:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
