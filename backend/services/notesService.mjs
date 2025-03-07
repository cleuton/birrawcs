import { getDB } from '../db.mjs';
import logger from '../util/logger.mjs';

export async function getNotes() {
  try{
    const db = getDB();
    const notesCollection = db.collection('notes');
    const notes = await notesCollection.find({}).sort({ datePosted: -1 }).toArray();
    return notes;  
  } catch (err) {
    logger.error(`erro ao buscar as notas: ${err}`);
    throw new Error('Erro ao buscar as notas');
  }
}
