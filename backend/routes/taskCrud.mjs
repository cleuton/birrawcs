import express from 'express';
import logger from '../util/logger.mjs';
import {
  criarTarefa,
  obterTarefaPorId,
  listarTarefas,
  atualizarTarefa,
  atualizarStatusTarefa,
  excluirTarefa
} from '../services/taskCrudService.mjs';

const router = express.Router();

router.post('/task', async (req, res) => {
  try {
    const token = req.cookies.token;
    const tarefa = await criarTarefa(req.body, token);
    res.status(201).json(tarefa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/task', async (req, res) => {
  try {
    const token = req.cookies.token;
    const tarefas = await listarTarefas(req.query, token);
    res.json(tarefas);
  } catch (err) {
    logger.error('Falha ao obter as tarefas:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.get('/task/:id', async (req, res) => {
  try {
    const token = req.cookies.token;
    const tarefa = await obterTarefaPorId(req.params.id, token);
    res.json(tarefa);
  } catch (err) {
    if (err.message === 'Tarefa não encontrada') {
      res.status(404).json({ error: err.message }); // Retorna 404 para tarefa não encontrada
    } else {
      logger.error(`Falha ao obter a tarefa: ${err}`);  
      res.status(400).json({ error: err.message });
    }
  }
});

router.put('/task/:id', async (req, res) => {
  try {
    const token = req.cookies.token;
    const tarefaAtualizada = await atualizarTarefa(req.params.id, req.body, token);
    res.json(tarefaAtualizada);
  } catch (err) {
    if (err.message === 'Tarefa não encontrada') {
      res.status(404).json({ error: err.message }); // Retorna 404 para tarefa não encontrada
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

router.patch('/task/:id', async (req, res) => {
  try {
    const token = req.cookies.token;
    const status = req.body.status;
    if (!token) {
      logger.error('Não autenticado');
      return res.status(401).json({ error: 'Não autenticado' });
    }    
    if (!status) {
      logger.error('Status da tarefa é obrigatório');
      throw new Error('Status da tarefa é obrigatório');
    }
    const tarefaAtualizada = await atualizarStatusTarefa(req.params.id, status, token);
    res.status(204).send();
  } catch (err) {
    if (err.message === 'Tarefa não encontrada') {
      res.status(404).json({ error: err.message }); // Retorna 404 para tarefa não encontrada
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

router.delete('/task/:id', async (req, res) => {
  try {
    const token = req.cookies.token;
    await excluirTarefa(req.params.id, token);
    res.status(204).send();
  } catch (err) {
    if (err.message === 'Tarefa não encontrada') {
      res.status(404).json({ error: err.message }); // Retorna 404 para tarefa não encontrada
    } else {
      logger.error('Falha ao excluir a tarefa:', err.message);
      res.status(400).json({ error: err.message });
    }
  }
});

export default router;