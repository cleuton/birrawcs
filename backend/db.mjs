import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'birradb';

export async function connectDB() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
  } catch (err) {
    console.error('Erro ao conectar no MongoDB:', err);
  }
}

export function getDB() {
  return client.db(dbName);
}
