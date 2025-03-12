// __tests__/services/summaryService.test.mjs
import { jest } from '@jest/globals';
import { Binary } from 'mongodb';

// Mock do módulo de banco
jest.unstable_mockModule('../../db.mjs', () => ({
  getDB: jest.fn(),
}));

// Mock do authService (apenas a função verifyToken)
jest.unstable_mockModule('../../services/authService.mjs', () => ({
  verifyToken: jest.fn(),
}));

// Importações dinâmicas após definir os mocks
const { getSummary } = await import('../../services/summaryService.mjs');
const { getDB } = await import('../../db.mjs');
const { verifyToken } = await import('../../services/authService.mjs');

describe('summaryService - getSummary', () => {
  // Valor de retorno para o token decodificado simulado
  const validDecoded = { id: '11111111-1111-1111-1111-111111111111' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar o resumo correto baseado nos resultados da agregação', async () => {
    // Simula o resultado da agregação no banco de dados
    const fakeAggregationResult = [
      { _id: 'pending', count: 5 },
      { _id: 'completed', count: 3 },
    ];

    // Cria um fake collection com método aggregate encadeado com toArray()
    const fakeCollection = {
      aggregate: jest.fn(() => ({
        toArray: jest.fn().mockResolvedValue(fakeAggregationResult),
      })),
    };

    // Configura getDB para retornar a fake collection na coleção 'tasks'
    getDB.mockReturnValue({
      collection: jest.fn(() => fakeCollection),
    });

    // Configura verifyToken para retornar o objeto decodificado simulado
    verifyToken.mockReturnValue(validDecoded);

    // Chama a função com um token simulado
    const token = 'validtoken';
    const summary = await getSummary(token);

    // Verifica se getDB foi chamado para obter a coleção 'tasks'
    expect(getDB().collection).toHaveBeenCalledWith('tasks');

    // Recria o pipeline esperado a partir do token decodificado
    const userIdBuffer = Buffer.from(validDecoded.id.replace(/-/g, ''), 'hex');
    const binaryUserId = new Binary(userIdBuffer, Binary.SUBTYPE_UUID);
    const expectedPipeline = [
      { $match: { $or: [
        { owner: binaryUserId },
        { requester: binaryUserId }
      ] } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ];
    expect(fakeCollection.aggregate).toHaveBeenCalledWith(expectedPipeline);

    // O resumo final deve considerar as contagens obtidas e zeros para os demais
    expect(summary).toEqual({
      pending: 5,
      working: 0,
      completed: 3,
      suspended: 0,
    });
  });

  it('deve propagar erros se a agregação falhar', async () => {
    const fakeError = new Error('Aggregation error');
    const fakeCollection = {
      aggregate: jest.fn(() => ({
        toArray: jest.fn().mockRejectedValue(fakeError),
      })),
    };
    getDB.mockReturnValue({
      collection: jest.fn(() => fakeCollection),
    });
    verifyToken.mockReturnValue(validDecoded);

    await expect(getSummary('validtoken')).rejects.toThrow('Erro ao buscar o resumo');
  });
});
