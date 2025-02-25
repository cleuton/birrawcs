// __tests__/services/taskService.test.mjs
import { jest } from '@jest/globals';
import { Binary } from 'mongodb';

// Mock do módulo do banco
jest.unstable_mockModule('../../db.mjs', () => ({
  getDB: jest.fn(),
}));

// Mock do authService (apenas a função verifyToken)
jest.unstable_mockModule('../../services/authService.mjs', () => ({
  verifyToken: jest.fn(),
}));

// Importações dinâmicas após definir os mocks
const { getTasksAndComments } = await import('../../services/tasksService.mjs');
const { getDB } = await import('../../db.mjs');
const { verifyToken } = await import('../../services/authService.mjs');

describe('tasksService - getTasksAndComments', () => {
  const fakeDecoded = { id: '11111111-1111-1111-1111-111111111111' };
  const token = 'validtoken';
  // Converte o ID simulado para Binary conforme a implementação
  const userIdBuffer = Buffer.from(fakeDecoded.id.replace(/-/g, ''), 'hex');
  const expectedBinaryUserId = new Binary(userIdBuffer, Binary.SUBTYPE_UUID);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar tasks e comments quando tasks com status pending/working são encontradas', async () => {
    verifyToken.mockReturnValue(fakeDecoded);

    // Fake tasks e comments para o cenário onde a primeira consulta retorna resultados
    const fakeTasks = [
      { title: 'Task 1', status: 'pending', dueDate: 200 },
      { title: 'Task 2', status: 'working', dueDate: 150 },
    ];
    const fakeComments = [
      { taskId: 'task1', userName: 'User A', datePosted: 300, text: 'Comment 1', viewed: false },
      { taskId: 'task2', userName: 'User B', datePosted: 250, text: 'Comment 2', viewed: false },
    ];

    // Cria uma fake collection com métodos encadeados
    const fakeCollection = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        project: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(fakeTasks),
      }),
      aggregate: jest.fn(() => ({
        toArray: jest.fn().mockResolvedValue(fakeComments),
      })),
    };

    getDB.mockReturnValue({
      collection: jest.fn(() => fakeCollection),
    });

    const result = await getTasksAndComments(token);
    expect(result).toEqual({ tasks: fakeTasks, comments: fakeComments });

    // Verifica o filtro utilizado na consulta para tasks pending/working
    expect(fakeCollection.find).toHaveBeenCalledWith({
      owner: expectedBinaryUserId,
      status: { $in: ['pending', 'working'] }
    });

    // Verifica o pipeline de agregação de comments
    const expectedPipeline = [
      { $match: { owner: expectedBinaryUserId } },
      { $unwind: "$comments" },
      { $match: { "comments.viewed": false } },
      { $project: {
          _id: 0,
          taskId: "$id",
          userName: "$comments.userName",
          datePosted: "$comments.datePosted",
          text: "$comments.text",
          viewed: "$comments.viewed"
      }},
      { $sort: { datePosted: -1 } }
    ];
    expect(fakeCollection.aggregate).toHaveBeenCalledWith(expectedPipeline);
  });

  it('deve buscar tasks "completed" se não houver tasks pending/working', async () => {
    verifyToken.mockReturnValue(fakeDecoded);

    // Simula que a primeira consulta não encontrou tasks
    const emptyTasks = [];
    // Simula que a segunda consulta retorna uma task "completed"
    const completedTask = [{ title: 'Completed Task', status: 'completed', dueDate: 100 }];
    const fakeComments = []; // Sem comentários para este cenário

    // Cria dois mocks encadeados:
    // Primeiro para a consulta de tasks com status "pending" ou "working"
    const chainPending = {
      sort: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValueOnce(emptyTasks),
    };

    // Segundo para a consulta de tasks com status "completed"
    const chainCompleted = {
      sort: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(), // simula o método limit
      toArray: jest.fn().mockResolvedValueOnce(completedTask),
    };

    // Simula o método find para retornar, na primeira chamada, chainPending e, na segunda, chainCompleted
    let findCallCount = 0;
    const fakeCollection = {
      find: jest.fn(() => {
        findCallCount++;
        return findCallCount === 1 ? chainPending : chainCompleted;
      }),
      aggregate: jest.fn(() => ({
        toArray: jest.fn().mockResolvedValue(fakeComments),
      })),
    };

    getDB.mockReturnValue({
      collection: jest.fn(() => fakeCollection),
    });

    const result = await getTasksAndComments(token);
    expect(result).toEqual({ tasks: completedTask, comments: fakeComments });

    // Verifica que a primeira chamada do find utiliza o filtro pending/working
    expect(fakeCollection.find).toHaveBeenNthCalledWith(1, {
      owner: expectedBinaryUserId,
      status: { $in: ['pending', 'working'] }
    });
    // E a segunda chamada utiliza o filtro completed
    expect(fakeCollection.find).toHaveBeenNthCalledWith(2, {
      owner: expectedBinaryUserId,
      status: 'completed'
    });
  });
});
