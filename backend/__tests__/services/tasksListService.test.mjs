// __tests__/services/tasksListService.test.mjs
import { jest } from '@jest/globals';
import { Binary } from 'mongodb';

jest.unstable_mockModule('../../db.mjs', () => ({
  getDB: jest.fn(),
}));

jest.unstable_mockModule('../../services/authService.mjs', () => ({
  verifyToken: jest.fn(),
}));

const { getTasks } = await import('../../services/tasksListService.mjs');
const { getDB } = await import('../../db.mjs');
const { verifyToken } = await import('../../services/authService.mjs');

describe('tasksListService - getTasks', () => {
  const fakeDecoded = { id: '11111111-1111-1111-1111-111111111111' };
  const token = 'validtoken';
  
  const uuidBuffer = Buffer.from(fakeDecoded.id.replace(/-/g, ''), 'hex');
  const expectedUserId = new Binary(uuidBuffer, Binary.SUBTYPE_UUID);

  let mockUsersCollection;
  let mockTasksCollection;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUsersCollection = {
      findOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    };

    mockTasksCollection = {
      find: jest.fn(() => ({
        project: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      })),
      countDocuments: jest.fn().mockResolvedValue(1),
    };

    getDB.mockReturnValue({
      collection: (name) => {
        if (name === 'users') return mockUsersCollection;
        if (name === 'tasks') return mockTasksCollection;
        return null;
      },
    });

    verifyToken.mockReturnValue(fakeDecoded);
  });

  it('retorna tasks filtradas por status para usuário não-admin', async () => {
    // Configura usuário como não-admin
    mockUsersCollection.findOne.mockResolvedValue({ admin: false });
    
    // Configura mock da coleção de tasks
    const mockTask = {
      title: 'Task 1',
      status: 'pending',
      dueDate: new Date('2023-11-05T18:00:00Z'),
      requester: expectedUserId,
      owner: expectedUserId
    };

    // Ajuste crítico: Mock do cursor com toArray()
    mockTasksCollection.find.mockReturnValue({
      project: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([mockTask]),
    });

    // Mock dos usuários para o map
    mockUsersCollection.find.mockReturnValue({
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([
        { _id: expectedUserId, name: 'Usuário 1' }
      ]),
    });

    const result = await getTasks(token, 'pending', 1, 10);

    expect(mockTasksCollection.countDocuments).toHaveBeenCalledWith({
      owner: expectedUserId,
      status: 'pending'
    });

    expect(result).toEqual({
      tasks: [
        {
          title: 'Task 1',
          status: 'pending',
          dueDate: new Date('2023-11-05T18:00:00Z'),
          requestedBy: 'Usuário 1',
          ownedBy: 'Usuário 1'
        }
      ],
      totalPages: 1
    });
  });

  it('retorna tasks filtradas por status para usuário admin', async () => {
    // Configura usuário como admin
    mockUsersCollection.findOne.mockResolvedValue({ admin: true });
    
    // Configura mock da coleção de tasks
    const mockTask = {
      title: 'Admin Task 1',
      status: 'pending',
      dueDate: new Date('2023-11-05T18:00:00Z'),
      requester: expectedUserId,
      owner: expectedUserId
    };

    // Ajuste crítico: Mock do cursor com toArray()
    mockTasksCollection.find.mockReturnValue({
      project: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([mockTask]),
    });

    // Mock dos usuários para o map
    mockUsersCollection.find.mockReturnValue({
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([
        { _id: expectedUserId, name: 'Usuário 1' }
      ]),
    });

    const result = await getTasks(token, 'pending', 1, 10);

    expect(mockTasksCollection.countDocuments).toHaveBeenCalledWith({
      requester: expectedUserId,
      status: 'pending'
    });

    expect(result).toEqual({
      tasks: [
        {
          title: 'Admin Task 1',
          status: 'pending',
          dueDate: new Date('2023-11-05T18:00:00Z'),
          requestedBy: 'Usuário 1',
          ownedBy: 'Usuário 1'
        }
      ],
      totalPages: 1
    });
  });
});