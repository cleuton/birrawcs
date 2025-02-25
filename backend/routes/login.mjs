import express from 'express';
import { login } from '../services/authService.mjs';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await login(email, password);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });
    return res.json({ message: 'Login realizado com sucesso' });
  } catch (err) {
    console.error('Erro no login:', err);
    if (err.message === 'Email e senha são obrigatórios') {
      return res.status(400).json({ error: err.message });
    }
    if (err.message === 'Credenciais inválidas') {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
