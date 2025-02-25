// routes/tasks.mjs
import express from 'express';
import jwt from 'jsonwebtoken';
import { Binary } from 'mongodb';
import { getDB } from '../db.mjs';

const router = express.Router();

router.get('/tasks', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }

  try {
    // Verifica o token e extrai o payload
    const decoded = jwt.verify(token, 'seu_segredo_super_secreto');
    const userIdString = decoded.id; // Ex: "11111111-1111-1111-1111-111111111111"
    // Converte o ID do usuário para Binary (UUID)
    const userIdBuffer = Buffer.from(userIdString.replace(/-/g, ''), 'hex');
    const binaryUserId = new Binary(userIdBuffer, Binary.SUBTYPE_UUID);

    const db = getDB();
    const tasksCollection = db.collection('tasks');

    // 1. Busca as tasks com status "pending" ou "working"
    let tasks = await tasksCollection.find({
      owner: binaryUserId,
      status: { $in: ['pending', 'working'] }
    })
      .sort({ dueDate: -1 }) // Ordem decrescente de dueDate
      .project({ title: 1, status: 1, dueDate: 1, _id: 0 })
      .toArray();

    // Se não houver tasks com status "pending" ou "working", retorna a última task "completed"
    if (tasks.length === 0) {
      tasks = await tasksCollection.find({
        owner: binaryUserId,
        status: 'completed'
      })
        .sort({ dueDate: -1 })
        .project({ title: 1, status: 1, dueDate: 1, _id: 0 })
        .limit(1)
        .toArray();
    }

    // 2. Agrega os comments de todas as tasks do usuário com viewed false
    // Inclui o id da task que contém cada comentário
    const comments = await tasksCollection.aggregate([
      { $match: { owner: binaryUserId } },
      { $unwind: "$comments" },
      { $match: { "comments.viewed": false } },
      { $project: {
          _id: 0,
          taskId: "$id",
          userName: "$comments.userName",
          datePosted: "$comments.datePosted",
          text: "$comments.text",
          viewed: "$comments.viewed"
      }},
      { $sort: { datePosted: -1 } }
    ]).toArray();

    return res.json({ tasks, comments });
  } catch (err) {
    console.error('Erro ao buscar tasks e comments:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
