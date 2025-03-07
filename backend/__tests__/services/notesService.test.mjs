// __tests__/services/notesService.test.mjs
import { jest } from '@jest/globals';

// Configura o mock do módulo do banco
jest.unstable_mockModule('../../db.mjs', () => ({
  getDB: jest.fn(),
}));

// Realize as importações dinâmicas após os mocks terem sido definidos
const { getNotes } = await import('../../services/notesService.mjs');
const { getDB } = await import('../../db.mjs');

describe('notesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Define um retorno padrão para evitar erros inesperados
    getDB.mockReturnValue({
      collection: jest.fn(() => ({
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn(),
      })),
    });
  });

  it('deve retornar as notas ordenadas por datePosted de forma decrescente', async () => {
    // Cria notas falsas já ordenadas conforme o esperado (maior datePosted primeiro)
    const fakeNotes = [
      { id: '2', title: 'Nota 2', datePosted: 200 },
      { id: '1', title: 'Nota 1', datePosted: 100 },
    ];

    // Configura o mock para retornar as notas falsas
    const fakeCollection = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue(fakeNotes),
    };
    getDB.mockReturnValue({
      collection: jest.fn(() => fakeCollection),
    });

    // Chama a função do service
    const notes = await getNotes();

    // Verifica se os métodos foram chamados corretamente
    expect(getDB().collection).toHaveBeenCalledWith('notes');
    expect(fakeCollection.find).toHaveBeenCalledWith({});
    expect(fakeCollection.sort).toHaveBeenCalledWith({ datePosted: -1 });
    expect(fakeCollection.toArray).toHaveBeenCalled();

    // Verifica se as notas retornadas correspondem às notas falsas
    expect(notes).toEqual(fakeNotes);
  });

  it('deve propagar erros caso ocorram na busca das notas', async () => {
    // Configura o mock para lançar um erro na chamada toArray
    const fakeError = new Error('Erro no banco de dados');
    const fakeCollection = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockRejectedValue(fakeError),
    };
    getDB.mockReturnValue({
      collection: jest.fn(() => fakeCollection),
    });

    // Verifica se a função rejeita com o erro esperado
    await expect(getNotes()).rejects.toThrow('Erro ao buscar as notas');
  });
});
