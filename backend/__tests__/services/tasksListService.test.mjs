import { jest } from '@jest/globals';
import { ObjectId } from 'mongodb';

// Mock dos módulos antes de qualquer importação
jest.unstable_mockModule('../../db.mjs', () => ({
  getDB: jest.fn(),
}));

jest.unstable_mockModule('../../services/authService.mjs', () => ({
  verifyToken: jest.fn(),
}));

// Importações dinâmicas após configurar os mocks
const { getTasks } = await import('../../services/tasksListService.mjs');
const { getDB } = await import('../../db.mjs');
const { verifyToken } = await import('../../services/authService.mjs');

describe('tasksListService - getTasks', () => {
  const fakeDecoded = { id: '111111111111111111111111' }; // 24 caracteres hexadecimais
  const token = 'validtoken';
  // Use ObjectId para compatibilizar com o service:
  const expectedUserId = new ObjectId(fakeDecoded.id);

  let mockUsersCollection;
  let mockTasksCollection;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configuração das coleções mockadas
    mockUsersCollection = {
      findOne: jest.fn(),
      find: jest.fn(),
    };
    mockTasksCollection = {
      find: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    };

    // Mock do getDB para retornar as coleções
    getDB.mockReturnValue({
      collection: jest.fn((name) => {
        if (name === 'users') return mockUsersCollection;
        if (name === 'tasks') return mockTasksCollection;
        return null;
      }),
    });

    // Configuração padrão do verifyToken para retornar fakeDecoded
    verifyToken.mockReturnValue(fakeDecoded);
  });

  it('retorna tasks filtradas por status para usuário não-admin', async () => {
    // Configura o usuário como não-admin
    mockUsersCollection.findOne.mockResolvedValue({ admin: false });
    // Mock das tarefas retornadas
    mockTasksCollection.toArray.mockResolvedValue([
      {
        title: 'Task 1',
        status: 'pending',
        dueDate: new Date('2023-11-05T18:00:00Z'),
        requester: expectedUserId,
        owner: expectedUserId
      },
    ]);
    // Mock dos usuários para o map (retorne Usuário 1 para que o resultado fique de acordo com a expectativa)
    mockUsersCollection.find.mockReturnValue({
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([
        { _id: expectedUserId, name: 'Usuário 1' }
      ]),
    });

    const result = await getTasks(token, 'pending', 1, 10);

    expect(result).toEqual([
      {
        title: 'Task 1',
        status: 'pending',
        dueDate: new Date('2023-11-05T18:00:00Z'),
        requestedBy: 'Usuário 1',
        ownedBy: 'Usuário 1'
      },
    ]);

    // Verifica se o filtro foi aplicado corretamente (owner para não-admin)
    expect(mockTasksCollection.find).toHaveBeenCalledWith({
      owner: expectedUserId,
      status: 'pending'
    });
  });

  it('retorna tasks filtradas por status para usuário admin', async () => {
    // Configura o usuário como admin
    mockUsersCollection.findOne.mockResolvedValue({ admin: true });
    // Mock das tarefas retornadas
    mockTasksCollection.toArray.mockResolvedValue([
      {
        title: 'Admin Task 1',
        status: 'pending',
        dueDate: new Date('2023-11-05T18:00:00Z'),
        requester: expectedUserId,
        owner: expectedUserId
      },
    ]);
    // Mock dos usuários para o map
    mockUsersCollection.find.mockReturnValue({
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([
        { _id: expectedUserId, name: 'Usuário 1' }
      ]),
    });

    const result = await getTasks(token, 'pending', 1, 10);

    expect(result).toEqual([
      {
        title: 'Admin Task 1',
        status: 'pending',
        dueDate: new Date('2023-11-05T18:00:00Z'),
        requestedBy: 'Usuário 1',
        ownedBy: 'Usuário 1'
      },
    ]);

    // Verifica se o filtro foi aplicado corretamente (requester para admin)
    expect(mockTasksCollection.find).toHaveBeenCalledWith({
      requester: expectedUserId,
      status: 'pending'
    });
  });
});
