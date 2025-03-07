import { getDB } from '../db.mjs';
import { verifyToken } from './authService.mjs';
import { Binary } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import logger from '../util/logger.mjs';

const gerarUuidString = () => uuidv4();

export const stringParaUuidBinario = (uuidString) => {
  if (!uuidString) {
    logger.error('UUID inválido');
    throw new Error('UUID inválido')
  };
  return new Binary(Buffer.from(uuidString.replace(/-/g, ''), 'hex'), Binary.SUBTYPE_UUID);
};

export const uuidBinarioParaString = (binaryUuid) => {
  const buffer = binaryUuid.buffer;
  const hex = buffer.toString('hex');
  return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20)}`;
};

export const criarTarefa = async (dadosTarefa, token) => {
  const decodificado = verifyToken(token);
  const idSolicitante = decodificado.id;
  try {
    const db = getDB();
    const colecaoTarefas = db.collection('tasks');
    const idBinario1 = gerarUuidString(); 
    const idBinario = stringParaUuidBinario(idBinario1);
    const novaTarefa = {
      id: idBinario,
      title: dadosTarefa.title,
      description: dadosTarefa.description,
      status: dadosTarefa.status,
      dueDate: new Date(dadosTarefa.dueDate),
      requester: stringParaUuidBinario(idSolicitante),
      owner: stringParaUuidBinario(dadosTarefa.owner),
      attachment: dadosTarefa.attachment || '',
      comments: dadosTarefa.comments || []
    };
    const resultado = await colecaoTarefas.insertOne(novaTarefa);
    if (!resultado.acknowledged) throw new Error('Falha ao inserir a tarefa');
  
    // Retorna o ID como string UUID
    return { ...novaTarefa, id: uuidBinarioParaString(idBinario) };
  
  } catch (error) {
    if (error.message === 'Falha ao inserir a tarefa') {
      throw error;
    } 
    logger.error(`Falha ao inserir a tarefa: ${error}`);
    throw new Error('Falha ao inserir a tarefa');
  }
  
};

export const listarTarefas = async (filtros, token) => {
  const decodificado = verifyToken(token);
  const idUsuario = decodificado.id;
  try {
    const db = getDB();
    const colecaoTarefas = db.collection('tasks');
  
    const consulta = {
      ...filtros,
      $or: [
        { owner: stringParaUuidBinario(idUsuario) },
        { requester: stringParaUuidBinario(idUsuario) }
      ]
    };
  
    return await colecaoTarefas.find(consulta).toArray();
  
  }
  catch (error) {
    logger.error(`Falha ao listar as tarefas: ${error}`);
    throw new Error('Falha ao listar as tarefas');
  }
};

export const obterTarefaPorId = async (idTarefa, token) => {
  const decodificado = verifyToken(token);
  const idUsuario = decodificado.id;

  try {
    const db = getDB();
    const colecaoTarefas = db.collection('tasks');
  
    const tarefa = await colecaoTarefas.findOne({
      id: stringParaUuidBinario(idTarefa)
    });
  
    if (!tarefa) {
      const errorMessage = 'Tarefa não encontrada';
      throw new Error(errorMessage);
    }
  
    // Converte o ID binário para string UUID
    return { ...tarefa, id: uuidBinarioParaString(tarefa.id) };
  } catch (error) {
    if (error.message === 'Tarefa não encontrada') {
      throw error;
    }
    logger.error(`Falha ao obter a tarefa: ${error}`);
    throw new Error('Falha ao obter a tarefa');
  }

};

export const atualizarTarefa = async (idTarefa, dadosAtualizacao, token) => {
  const decodificado = verifyToken(token);
  const idUsuario = decodificado.id;
  const isAdmin = decodificado.role === 'admin'; 
  const db = getDB();
  const colecaoTarefas = db.collection('tasks');

  // Validação dos argumentos
  if (!idTarefa || typeof idTarefa !== 'string') {
    throw new Error('ID da tarefa inválido');
  }

  const atributosObrigatorios = ['title', 'description', 'status', 'dueDate', 'owner', 'requester'];
  const atributosFaltantes = atributosObrigatorios.filter(attr => !dadosAtualizacao.hasOwnProperty(attr));

  if (atributosFaltantes.length > 0) {
    logger.error(`Os seguintes atributos obrigatórios estão faltando: ${atributosFaltantes.join(', ')}`);
    throw new Error(`Os seguintes atributos obrigatórios estão faltando: ${atributosFaltantes.join(', ')}`);
  }

  try{ 

      // Permitir apenas admins alterarem o owner
      if (!isAdmin) {
        logger.error('Apenas administradores podem alterar o responsável');
        throw new Error('Apenas administradores podem alterar o responsável');
      }
      if (dadosAtualizacao.hasOwnProperty('_id')) {
        delete dadosAtualizacao._id;
      }
    let resultado;
      try {
        resultado = await colecaoTarefas.updateOne(
          { 
            id: stringParaUuidBinario(idTarefa)
          },
          { $set: dadosAtualizacao }
        );
      } catch (error) {
        logger.error(`Falha ao atualizar a tarefa: ${error}`);
        throw new Error('Falha ao atualizar a tarefa');
      }
      if (resultado.matchedCount === 0) {
        logger.error('Tarefa não encontrada');
        throw new Error('Tarefa não encontrada')
      };
    
      return { ...dadosAtualizacao, id: dadosAtualizacao.id };
  }
  catch (error) {
    logger.error(`Falha ao atualizar a tarefa: ${error}`);
    throw new Error('Falha ao atualizar a tarefa');
  }
};

export const excluirTarefa = async (idTarefa, token) => {
  const decodificado = verifyToken(token);
  const idUsuario = decodificado.id;
  const isAdmin = decodificado.role === 'admin'; 
  // Permitir apenas admins excluam tarefas
  if (!isAdmin) {
    logger.error('Apenas administradores podem alterar o responsável');
    throw new Error('Apenas administradores podem alterar o responsável');
  }

  try {
    const db = getDB();
    const colecaoTarefas = db.collection('tasks');
    const resultado = await colecaoTarefas.deleteOne({
      id: stringParaUuidBinario(idTarefa)
    });

    if (resultado.deletedCount === 0) throw new Error('Tarefa não encontrada');
  }
  catch (error) {
    if (error.message === 'Tarefa não encontrada') {
      throw error;
    } 
    logger.error(`Falha ao excluir a tarefa:' ${error}`);
    throw new Error('Falha ao excluir a tarefa');
  }
};