import { getDB } from '../db.mjs';
import { verifyToken } from './authService.mjs';
import { Binary } from 'mongodb';
import logger from '../util/logger.mjs';

export async function getTasksAndComments(token) {

  try {
    // 1. Decodifica o token para obter userId (string)
    const decoded = verifyToken(token);
    const userIdString = decoded.id;

    // 2. Converte a string em Binary (UUID)
    const userIdBuffer = Buffer.from(userIdString.replace(/-/g, ''), 'hex');
    const binaryUserId = new Binary(userIdBuffer, Binary.SUBTYPE_UUID);

    // 3. Acessa o banco/coleções
    const db = getDB();
    const usersCollection = db.collection('users');
    const tasksCollection = db.collection('tasks');

    // 4. Verifica se é admin (userDoc.admin === true)
    const userDoc = await usersCollection.findOne({ id: binaryUserId });
    const isAdmin = userDoc?.admin === true;

    let tasks;

    // ============= LÓGICA PARA ADMIN =============
    if (isAdmin) {
      // Admin é o "requester" das tarefas
      tasks = await tasksCollection.find({
        requester: binaryUserId, // <--- important
        status: { $in: ['pending', 'working'] }
      })
      .sort({ dueDate: -1 })
      .project({ id: 1, title: 1, status: 1, dueDate: 1, _id: 0 })
      .toArray();

      // Se não encontrar tasks 'pending' ou 'working',
      // pega apenas a última (qualquer status).
      if (tasks.length === 0) {
        tasks = await tasksCollection.find({
          requester: binaryUserId
        })
        .sort({ dueDate: -1 })
        .project({ title: 1, status: 1, dueDate: 1, _id: 0 })
        .limit(1)
        .toArray();
      }

    // ============= LÓGICA PARA NÃO-ADMIN =============
    } else {
      // Usuário não-admin é o "owner" das tarefas
      tasks = await tasksCollection.find({
        owner: binaryUserId, 
        status: { $in: ['pending', 'working'] }
      })
      .sort({ dueDate: -1 })
      .project({ id: 1, title: 1, status: 1, dueDate: 1, _id: 0 })
      .toArray();

      // Se não encontrar, busca a última com status "completed"
      if (tasks.length === 0) {
        tasks = await tasksCollection.find({
          owner: binaryUserId,
          status: 'completed'
        })
        .sort({ dueDate: -1 })
        .project({ id: 1, title: 1, status: 1, dueDate: 1, _id: 0 })
        .limit(1)
        .toArray();
      }
    }

    // 5. Comentários não lidos (viewed = false):
    // Se o usuário é admin, a tarefa tem "requester: userId";
    // se não, a tarefa tem "owner: userId".
    const matchField = isAdmin
      ? { requester: binaryUserId }
      : { owner: binaryUserId };

    const comments = await tasksCollection.aggregate([
      { $match: matchField },
      { $unwind: "$comments" },
      { $match: { "comments.viewed": false } },
      {
        $project: {
          _id: 0,
          taskId: "$id",
          userName: "$comments.userName",
          datePosted: "$comments.datePosted",
          text: "$comments.text",
          viewed: "$comments.viewed"
        }
      },
      { $sort: { datePosted: -1 } }
    ]).toArray();

    return { tasks, comments };
  } catch (erro) {
    logger.error(`Erro ao obter tarefas e comentários ${erro}`);
    throw new Error('Erro ao obter tarefas e comentários');
  }

}
