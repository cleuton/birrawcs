import express from 'express';
import { verifyToken } from '../services/authService.mjs';
import { getUserIdentity } from '../services/userService.mjs';
import { getUsersByRole } from '../services/userService.mjs';
import logger from '../util/logger.mjs';

const router = express.Router();

router.get('/user', async (req, res) => {
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

router.get('/user/:id/detail', async (req, res) => {  
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ error: 'Não autenticado' });
      
      const decoded = verifyToken(token);
      const user = await getUserIdentity(req.params.id);
      res.json(user);
    } catch (err) {
      if (err.message === 'Token inválido') {
        logger.error(`Falha ao obter usuários - token inválido: ${err}`);
        return res.status(403).json({ error: 'Not authenticated' });
      }
      logger.error(`Falha ao obter o usuário: ${err}`);
      res.status(500).json({ error: 'Falha ao obter o usuário' });
    }
});


router.get('/user/:role', async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ error: 'Não autenticado' });
      const decoded = verifyToken(token);
      
      const users = await getUsersByRole(req.params.role === 'admin');
      res.json(users);
    } catch (err) {
      if (err.message === 'Token inválido') {
        logger.error(`Falha ao obter usuários - token inválido: ${err}`);
        return res.status(403).json({ error: 'Not authenticated' });
      }      
      logger.error(`Falha ao obter usuários: ${err}`);
      res.status(500).json({ error: 'Falha ao obter usuários' });
    }
});

export default router;