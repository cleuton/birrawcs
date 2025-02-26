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

  let mockUsersCollection;
  let mockTasksCollection;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mocks das collections
    mockUsersCollection = {
      findOne: jest.fn(), // vamos controlar se retorna admin: true ou false
    };
    mockTasksCollection = {
      find: jest.fn(),
      aggregate: jest.fn(),
    };

    // Mock do getDB para retornar as duas coleções
    getDB.mockReturnValue({
      collection: jest.fn((name) => {
        if (name === 'users') return mockUsersCollection;
        if (name === 'tasks') return mockTasksCollection;
        return null;
      }),
    });

    // Por padrão, o verifyToken devolve fakeDecoded
    verifyToken.mockReturnValue(fakeDecoded);
  });

  // =============== Cenário 1: Usuario NÃO-ADMIN com tasks pendentes/working ===============
  it('não-admin: retorna tasks e comments quando tasks pending/working são encontradas', async () => {
    // 1) Retorna um usuário com admin: false
    mockUsersCollection.findOne.mockResolvedValueOnce({ admin: false });

    // 2) Fake tasks e comments
    const fakeTasks = [
      { title: 'Task 1', status: 'pending', dueDate: 200 },
      { title: 'Task 2', status: 'working', dueDate: 150 },
    ];
    const fakeComments = [
      { taskId: 'task1', userName: 'User A', datePosted: 300, text: 'Comment 1', viewed: false },
    ];

    // 3) Mock do find() pendente/working
    mockTasksCollection.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue(fakeTasks),
    });

    // 4) Mock do aggregate() => comments
    mockTasksCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(fakeComments),
    });

    // 5) Executa
    const result = await getTasksAndComments(token);

    // 6) Verifica se retornou corretamente
    expect(result).toEqual({ tasks: fakeTasks, comments: fakeComments });

    // 7) Verifica que a query foi feita em owner (não-admin)
    expect(mockTasksCollection.find).toHaveBeenCalledWith({
      owner: expectedBinaryUserId,
      status: { $in: ['pending', 'working'] },
    });

    // 8) Verifica pipeline de comments
    expect(mockTasksCollection.aggregate).toHaveBeenCalledWith([
      { $match: { owner: expectedBinaryUserId } },
      { $unwind: "$comments" },
      { $match: { "comments.viewed": false } },
      {
        $project: {
          _id: 0,
          taskId: "$id",
          userName: "$comments.userName",
          datePosted: "$comments.datePosted",
          text: "$comments.text",
          viewed: "$comments.viewed",
        },
      },
      { $sort: { datePosted: -1 } },
    ]);
  });

  // =============== Cenário 2: Usuario NÃO-ADMIN sem tasks pendentes => pega completed ===============
  it('não-admin: busca tasks "completed" se não houver tasks pending/working', async () => {
    // 1) Retorna um usuário com admin: false
    mockUsersCollection.findOne.mockResolvedValueOnce({ admin: false });

    // 2) Primeira consulta sem tasks
    const emptyTasks = [];
    // Segunda consulta com completed
    const completedTask = [{ title: 'Completed Task', status: 'completed', dueDate: 100 }];
    const fakeComments = [];

    // 3) Mock encadeado
    const chainPending = {
      sort: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValueOnce(emptyTasks),
    };
    const chainCompleted = {
      sort: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValueOnce(completedTask),
    };

    let findCallCount = 0;
    mockTasksCollection.find.mockImplementation(() => {
      findCallCount++;
      return findCallCount === 1 ? chainPending : chainCompleted;
    });

    mockTasksCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(fakeComments),
    });

    const result = await getTasksAndComments(token);
    expect(result).toEqual({ tasks: completedTask, comments: fakeComments });

    // Verifica consultas
    expect(mockTasksCollection.find).toHaveBeenNthCalledWith(1, {
      owner: expectedBinaryUserId,
      status: { $in: ['pending', 'working'] },
    });
    expect(mockTasksCollection.find).toHaveBeenNthCalledWith(2, {
      owner: expectedBinaryUserId,
      status: 'completed',
    });
  });

  // =============== Cenário 3: Usuario ADMIN com tasks pendentes/working ===============
  it('admin: retorna tasks e comments quando tasks pending/working são encontradas (usa requester)', async () => {
    // 1) Retorna userDoc com admin: true
    mockUsersCollection.findOne.mockResolvedValueOnce({ admin: true });

    // 2) Fake tasks e comments
    const fakeTasks = [
      { title: 'Admin Task 1', status: 'pending', dueDate: 300 },
      { title: 'Admin Task 2', status: 'working', dueDate: 200 },
    ];
    const fakeComments = [
      { taskId: 'taskAdmin1', userName: 'User A', datePosted: 500, text: 'Comment X', viewed: false },
    ];

    // 3) Mock find => tasks
    mockTasksCollection.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue(fakeTasks),
    });

    // 4) Mock aggregate => comments
    mockTasksCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(fakeComments),
    });

    // 5) Executa
    const result = await getTasksAndComments(token);

    // 6) Verifica resultado
    expect(result).toEqual({ tasks: fakeTasks, comments: fakeComments });

    // 7) Verifica que a query foi feita em requester
    expect(mockTasksCollection.find).toHaveBeenCalledWith({
      requester: expectedBinaryUserId,
      status: { $in: ['pending', 'working'] },
    });

    // 8) Verifica pipeline de comments => requester
    expect(mockTasksCollection.aggregate).toHaveBeenCalledWith([
      { $match: { requester: expectedBinaryUserId } },
      { $unwind: "$comments" },
      { $match: { "comments.viewed": false } },
      {
        $project: {
          _id: 0,
          taskId: "$id",
          userName: "$comments.userName",
          datePosted: "$comments.datePosted",
          text: "$comments.text",
          viewed: "$comments.viewed",
        },
      },
      { $sort: { datePosted: -1 } },
    ]);
  });

  // =============== Cenário 4 (opcional): Usuario ADMIN sem tasks pendentes => pega última ===============
  it('admin: se não houver tasks pending/working, pega a última task cadastrada', async () => {
    mockUsersCollection.findOne.mockResolvedValueOnce({ admin: true });

    // Primeira consulta sem tasks
    const emptyTasks = [];
    // Segunda consulta sem filtrar status => pega apenas 1
    const lastTask = [{ title: 'Admin Last Task', status: 'completed', dueDate: 50 }];
    const fakeComments = [];

    const chainPending = {
      sort: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValueOnce(emptyTasks),
    };
    const chainLast = {
      sort: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValueOnce(lastTask),
    };

    let findCallCount = 0;
    mockTasksCollection.find.mockImplementation(() => {
      findCallCount++;
      return findCallCount === 1 ? chainPending : chainLast;
    });

    mockTasksCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(fakeComments),
    });

    const result = await getTasksAndComments(token);
    expect(result).toEqual({ tasks: lastTask, comments: fakeComments });

    // Verifica consultas
    // 1ª => tasks pendentes/working
    expect(mockTasksCollection.find).toHaveBeenNthCalledWith(1, {
      requester: expectedBinaryUserId,
      status: { $in: ['pending', 'working'] },
    });
    // 2ª => qualquer status
    expect(mockTasksCollection.find).toHaveBeenNthCalledWith(2, {
      requester: expectedBinaryUserId,
    });
  });
});
