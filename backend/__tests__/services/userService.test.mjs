import { jest } from '@jest/globals';
import { stringParaUuidBinario } from '../../services/taskCrudService.mjs';

// Configura o mock do módulo do banco
jest.unstable_mockModule('../../db.mjs', () => ({
    getDB: jest.fn(),
  }));

const { getDB } = await import('../../db.mjs');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Garante que getDB retorne um objeto padrão para evitar undefined.collection
    getDB.mockReturnValue({
      collection: jest.fn(() => ({ findOne: jest.fn() })),
    });
  });

  describe('getUserIdentity function', () => {
    it('deve lançar erro se UUID do usuário não for informado', async () => {
      const { getUserIdentity } = await import('../../services/userService.mjs');
      await expect(getUserIdentity(null)).rejects.toThrow('UUID do usuário não informado');
    });

    it('deve lançar erro se falhar ao obter o usuário', async () => {
      const { getUserIdentity } = await import('../../services/userService.mjs');
      const fakeCollection = { findOne: jest.fn().mockRejectedValue(new Error('Erro ao obter usuário')) };
      getDB.mockReturnValue({ collection: jest.fn(() => fakeCollection) });

      await expect(getUserIdentity('123')).rejects.toThrow('Falha ao obter o usuário');
    });

    it('deve retornar as informações do usuário', async () => {
      const { getUserIdentity } = await import('../../services/userService.mjs');
      const fakeUser = {
        id: '123',
        email: 'user@example.com',
        name: 'John Doe',
        admin: false
      };
      const fakeReturned = {
        id: '123',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'user'
      };

      const fakeCollection = { findOne: jest.fn().mockResolvedValue(fakeUser) };
      getDB.mockReturnValue({ collection: jest.fn(() => fakeCollection) });

      const result = await getUserIdentity('123');   
      expect(result).toEqual(fakeReturned);
    });
  });
});

describe('getUsersByRole function', () => { 
    it('deve lançar erro se papel do usuário não for informado', async () => {
        const { getUsersByRole } = await import('../../services/userService.mjs');
        await expect(getUsersByRole(null)).rejects.toThrow('Papel do usuário não informado');
    });
    
    it('deve lançar erro se falhar ao obter usuários', async () => {
        const { getUsersByRole } = await import('../../services/userService.mjs');
        const fakeCollection = { find: jest.fn().mockReturnValue({ toArray: jest.fn().mockRejectedValue(new Error('Erro ao obter usuários')) }) };
        getDB.mockReturnValue({ collection: jest.fn(() => fakeCollection) });
    
        await expect(getUsersByRole(true)).rejects.toThrow('Falha ao obter usuários');
    });
    
    it('deve retornar os usuários com o papel informado', async () => {
        const { getUsersByRole } = await import('../../services/userService.mjs');
        const fakeUsers = [
        {
            id: '123',
            email: 'Fulano@teste.com',
            name: 'Fulano',
            admin: true
        },
        {
            id: '456',
            email: 'Beltrano@teste',
            name: 'Beltrano',
            admin: true
        },
        {
            id: '789',
            email: 'cicrano@teste',
            name: 'Cicrano',
            admin: false
        },
        {
            id: '101112',
            email: 'jose@teste',
            name: 'Jose',
            admin: false
        }        
        ];
        const fakeReturnedAdmin = [
        {
            id: '123',
            email: 'Fulano@teste.com',
            name: 'Fulano'
        },
        {
            id: '456',
            email: 'Beltrano@teste',
            name: 'Beltrano'
        }
        ];
        const fakeReturnedUser = [
        {
            id: '789',
            email: 'cicrano@teste',
            name: 'Cicrano'
        },
        {
            id: '101112',
            email: 'jose@teste',
            name: 'Jose'
        }
        ];
        const fakeCollection = { find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue(fakeReturnedAdmin) }) };
        getDB.mockReturnValue({ collection: jest.fn(() => fakeCollection) });
        const result = await getUsersByRole(true);   
        expect(result).toEqual(fakeReturnedAdmin);

        const fakeCollection2 = { find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue(fakeReturnedUser) }) };
        getDB.mockReturnValue({ collection: jest.fn(() => fakeCollection2) });
        const result2 = await getUsersByRole(false);   
        expect(result2).toEqual(fakeReturnedUser);
    });
});
