import { getDB } from '../db.mjs';
import { verifyToken } from './authService.mjs';
import { Binary } from 'mongodb';
import logger from '../util/logger.mjs';

export async function getSummary(token) {
  const decoded = verifyToken(token);
  const userIdString = decoded.id;

  // Converte o ID do usuário para Binary (UUID)
  const userIdBuffer = Buffer.from(userIdString.replace(/-/g, ''), 'hex');
  const binaryUserId = new Binary(userIdBuffer, Binary.SUBTYPE_UUID);
  try {
    const db = getDB();
    const tasksCollection = db.collection('tasks');
  
    const pipeline = [
      { $match: { $or: [
        { owner: binaryUserId },
        { requester: binaryUserId }
      ] } },
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
  
    return summary;
  
  } catch (err) {
    logger.error('Erro ao buscar o resumo:' + err.message);
    throw new Error('Erro ao buscar o resumo');
  }
}
