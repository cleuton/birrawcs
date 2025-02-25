import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getDB } from '../db.mjs';

const router = express.Router();

router.post('/login', async (req, res) => {
  const db = getDB();
  const usersCollection = db.collection('users');

  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const match = await bcrypt.compare(password, user.hashpw);
    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      'seu_segredo_super_secreto',
      { expiresIn: '15m' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ message: 'Login realizado com sucesso' });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
