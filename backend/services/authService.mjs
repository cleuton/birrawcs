import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getDB } from '../db.mjs';
import logger from '../util/logger.mjs';

const SECRET = 'seu_segredo_super_secreto';

export async function login(email, password) {

  const db = getDB();
  const usersCollection = db.collection('users');

  if (!email || !password) {
    logger.error('Email e senha são obrigatórios');
    throw new Error('Email e senha são obrigatórios');
  }

  const user = await usersCollection.findOne({ email });
  if (!user) {
    logger.error('Credenciais inválidas');
    throw new Error('Credenciais inválidas');
  }

  const match = await bcrypt.compare(password, user.hashpw);
  if (!match) {
    throw new Error('Credenciais inválidas');
  }

  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.admin ? 'admin' : 'user' // Adiciona esta linha
    },
    SECRET,
    { expiresIn: '15m' }
  );

  return token;
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded;
  } catch (err) {
    logger.error('Token inválido');
    throw new Error('Token inválido');
  }
}
