import { getDB } from '../db.mjs';

export async function getNotes() {
  const db = getDB();
  const notesCollection = db.collection('notes');
  const notes = await notesCollection.find({}).sort({ datePosted: -1 }).toArray();
  return notes;
}
