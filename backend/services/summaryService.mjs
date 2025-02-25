import { getDB } from '../db.mjs';
import { verifyToken } from './authService.mjs';
import { Binary } from 'mongodb';

export async function getSummary(token) {
  const decoded = verifyToken(token);
  const userIdString = decoded.id;

  // Converte o ID do usuário para Binary (UUID)
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

  return summary;
}
