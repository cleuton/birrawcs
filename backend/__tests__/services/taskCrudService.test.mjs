// __tests__/services/taskCrudService.test.mjs
import { jest } from '@jest/globals';
import { Binary } from 'mongodb';

// Mock do módulo de banco de dados
jest.unstable_mockModule('../../db.mjs', () => ({
  getDB: jest.fn(),
}));

// Mock do authService (apenas a função verifyToken)
jest.unstable_mockModule('../../services/authService.mjs', () => ({
  verifyToken: jest.fn(),
}));

// Importações dinâmicas após definir os mocks
const { criarTarefa, obterTarefaPorId, listarTarefas, atualizarTarefa, excluirTarefa } = await import('../../services/taskCrudService.mjs');
const { getDB } = await import('../../db.mjs');
const { verifyToken } = await import('../../services/authService.mjs');

describe('taskCrudService - CRUD de Tarefas', () => {
  const fakeDecoded = { id: '11111111-1111-1111-1111-111111111111' };
  const token = 'validtoken';

  const uuidBuffer = Buffer.from(fakeDecoded.id.replace(/-/g, ''), 'hex');
  const expectedUserId = new Binary(uuidBuffer, Binary.SUBTYPE_UUID);

  let mockTasksCollection;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTasksCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      toArray: jest.fn(),
    };

    getDB.mockReturnValue({
      collection: (name) => {
        if (name === 'tasks') return mockTasksCollection;
        return null;
      },
    });

    verifyToken.mockReturnValue(fakeDecoded);
  });

  describe('criarTarefa', () => {
    it('deve criar uma tarefa com sucesso', async () => {
      const novaTarefa = {
        title: 'Nova Tarefa',
        description: 'Descrição da nova tarefa',
        status: 'pending',
        dueDate: new Date(),
        owner: '22222222-2222-2222-2222-222222222222',
        attachment: '',
        comments: [],
      };

      mockTasksCollection.insertOne.mockResolvedValue({ acknowledged: true, insertedId: '67c9a7dec971f3061996d76d' });

      const resultado = await criarTarefa(novaTarefa, token);

      expect(mockTasksCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          title: novaTarefa.title,
          description: novaTarefa.description,
          status: novaTarefa.status,
          dueDate: expect.any(Date),
          requester: expectedUserId,
          owner: expect.any(Binary),
          attachment: '',
          comments: [],
        })
      );

      expect(resultado).toHaveProperty('id');
      expect(resultado.title).toBe(novaTarefa.title);
    });

    it('deve lançar erro se falhar ao inserir a tarefa', async () => {
      mockTasksCollection.insertOne.mockResolvedValue({ acknowledged: false });

      await expect(criarTarefa({}, token)).rejects. toThrow();
    });
  });

  describe('obterTarefaPorId', () => {
    it('deve retornar uma tarefa existente', async () => {
      const mockTask = {
        id: new Binary(Buffer.from('d98d1422eb8546eeac283b66692cf180', 'hex'), Binary.SUBTYPE_UUID),
        title: 'Tarefa Teste',
        description: 'Descrição da tarefa de teste',
        status: 'pending',
        dueDate: new Date(),
        requester: expectedUserId,
        owner: expectedUserId,
      };

      mockTasksCollection.findOne.mockResolvedValue(mockTask);

      const resultado = await obterTarefaPorId('d98d1422-eb85-46ee-ac28-3b66692cf180', token);

      expect(mockTasksCollection.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Binary)
        })
      );

      expect(resultado.title).toBe(mockTask.title);
    });

    it('deve lançar erro se a tarefa não for encontrada', async () => {
      mockTasksCollection.findOne.mockResolvedValue(null);

      await expect(obterTarefaPorId('invalid-id', token)).rejects.toThrow('Tarefa não encontrada');
    });
  });

  describe('listarTarefas', () => {
    it('deve listar tarefas com base nos filtros', async () => {
      const mockTasks = [
        {
          id: new Binary(Buffer.from('d98d1422eb8546eeac283b66692cf180', 'hex'), Binary.SUBTYPE_UUID),
          title: 'Tarefa 1',
          status: 'pending',
          dueDate: new Date(),
          requester: expectedUserId,
          owner: expectedUserId,
        },
      ];

      mockTasksCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockTasks),
      });

      const resultado = await listarTarefas({ status: 'pending' }, token);

      expect(mockTasksCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
          $or: [
            { owner: expectedUserId },
            { requester: expectedUserId },
          ],
        })
      );

      expect(resultado).toEqual(mockTasks);
    });
  });

  describe('atualizarTarefa', () => {
    it('deve atualizar uma tarefa existente', async () => {

      const fakeDecodedAdmin = { id: '11111111-1111-1111-1111-111111111111', role: 'admin' };
      verifyToken.mockReturnValue(fakeDecodedAdmin);
      const mockTask = {
        id: new Binary(Buffer.from('d98d1422eb8546eeac283b66692cf180', 'hex'), Binary.SUBTYPE_UUID),
        title: 'Tarefa Atualizada',
        status: 'completed',
        dueDate: new Date(),
        requester: expectedUserId,
        owner: expectedUserId,
      };

      mockTasksCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
      mockTasksCollection.findOne.mockResolvedValue(mockTask);

      const resultado = await atualizarTarefa('d98d1422-eb85-46ee-ac28-3b66692cf180', { status: 'completed' }, token);

      expect(mockTasksCollection.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Binary)
        }),
        { $set: { status: 'completed' } }
      );

      expect(resultado.status).toBe('completed');
    });

    it('deve lançar erro se a tarefa não for encontrada', async () => {
      const fakeDecodedAdmin = { id: '11111111-1111-1111-1111-111111111111', role: 'admin' };
      verifyToken.mockReturnValue(fakeDecodedAdmin);
      mockTasksCollection.updateOne.mockResolvedValue({ matchedCount: 0 });

      await expect(atualizarTarefa('invalid-id', {}, token)).rejects.toThrow('Falha ao atualizar a tarefa');
    });
  });

  describe('excluirTarefa', () => {
    it('deve excluir uma tarefa existente', async () => {

      const fakeDecodedAdmin = { id: '11111111-1111-1111-1111-111111111111', role: 'admin' };
      verifyToken.mockReturnValue(fakeDecodedAdmin);

      mockTasksCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await excluirTarefa('d98d1422-eb85-46ee-ac28-3b66692cf180', token);

      expect(mockTasksCollection.deleteOne).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Binary)
        })
      );
    });

    it('deve lançar erro se a tarefa não for encontrada', async () => {
      const fakeDecodedAdmin = { id: '11111111-1111-1111-1111-111111111111', role: 'admin' };
      verifyToken.mockReturnValue(fakeDecodedAdmin);      
      mockTasksCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(excluirTarefa('invalid-id', token)).rejects.toThrow('Falha ao excluir a tarefa');
    });
  });
});