import { getDB } from '../db.mjs';
import { verifyToken } from './authService.mjs';
import { Binary } from 'mongodb';

export async function getTasksAndComments(token) {
  const decoded = verifyToken(token);
  const userIdString = decoded.id;

  // Converte o ID do usuário para Binary (UUID)
  const userIdBuffer = Buffer.from(userIdString.replace(/-/g, ''), 'hex');
  const binaryUserId = new Binary(userIdBuffer, Binary.SUBTYPE_UUID);

  const db = getDB();
  const tasksCollection = db.collection('tasks');

  // 1. Busca tasks com status "pending" ou "working"
  let tasks = await tasksCollection.find({
    owner: binaryUserId,
    status: { $in: ['pending', 'working'] }
  })
    .sort({ dueDate: -1 })
    .project({ title: 1, status: 1, dueDate: 1, _id: 0 })
    .toArray();

  // Se não encontrar, busca a última task "completed"
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

  // 2. Agrega os comments das tasks do usuário com viewed false
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

  return { tasks, comments };
}
