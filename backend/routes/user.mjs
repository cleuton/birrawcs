import express from 'express';
import { verifyToken } from '../services/authService.mjs';

const router = express.Router();

router.get('/user', (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ error: 'Não autenticado' });
      
      const decoded = verifyToken(token);
      res.json({ 
        role: decoded.role || 'user', // Define 'user' como padrão
        userId: decoded.id 
      });
    } catch (err) {
      res.status(401).json({ error: 'Token inválido' });
    }
  });

export default router;