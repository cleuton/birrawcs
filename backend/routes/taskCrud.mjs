import express from 'express';
import {
  criarTarefa,
  obterTarefaPorId,
  listarTarefas,
  atualizarTarefa,
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

router.delete('/task/:id', async (req, res) => {
  try {
    const token = req.cookies.token;
    await excluirTarefa(req.params.id, token);
    res.status(204).send();
  } catch (err) {
    if (err.message === 'Tarefa não encontrada') {
      res.status(404).json({ error: err.message }); // Retorna 404 para tarefa não encontrada
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

export default router;