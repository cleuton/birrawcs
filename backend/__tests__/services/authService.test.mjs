// __tests__/services/authService.test.mjs
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Configura o mock do módulo do banco
jest.unstable_mockModule('../../db.mjs', () => ({
  getDB: jest.fn(),
}));

// Configura o mock do bcrypt para fornecer também a exportação default
jest.unstable_mockModule('bcrypt', () => {
  const compareMock = jest.fn();
  return {
    __esModule: true,
    // Fornece a exportação default com a função compare
    default: { compare: compareMock },
    compare: compareMock,
  };
});

// Realize as importações dinâmicas após os mocks terem sido definidos
const { login, verifyToken } = await import('../../services/authService.mjs');
const { getDB } = await import('../../db.mjs');
const bcrypt = await import('bcrypt');

describe('authService', () => {
  const fakeUser = {
    id: '123',
    email: 'user@example.com',
    hashpw: 'hashedpassword',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Garante que getDB retorne um objeto padrão para evitar undefined.collection
    getDB.mockReturnValue({
      collection: jest.fn(() => ({ findOne: jest.fn() })),
    });
  });

  describe('login function', () => {
    it('deve lançar erro se email não for informado', async () => {
      await expect(login(null, 'password')).rejects.toThrow('Email e senha são obrigatórios');
    });

    it('deve lançar erro se password não for informado', async () => {
      await expect(login('user@example.com', null)).rejects.toThrow('Email e senha são obrigatórios');
    });

    it('deve lançar erro se o usuário não for encontrado', async () => {
      const fakeCollection = { findOne: jest.fn().mockResolvedValue(null) };
      getDB.mockReturnValue({ collection: jest.fn(() => fakeCollection) });
      
      await expect(login('nonexistent@example.com', 'password')).rejects.toThrow('Credenciais inválidas');
      expect(fakeCollection.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
    });

    it('deve lançar erro se a senha estiver incorreta', async () => {
      const fakeCollection = { findOne: jest.fn().mockResolvedValue(fakeUser) };
      getDB.mockReturnValue({ collection: jest.fn(() => fakeCollection) });
      bcrypt.compare.mockResolvedValue(false);

      await expect(login('user@example.com', 'wrongpassword')).rejects.toThrow('Credenciais inválidas');
      expect(fakeCollection.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', fakeUser.hashpw);
    });

    it('deve retornar um token válido se o login for bem-sucedido', async () => {
      const fakeCollection = { findOne: jest.fn().mockResolvedValue(fakeUser) };
      getDB.mockReturnValue({ collection: jest.fn(() => fakeCollection) });
      bcrypt.compare.mockResolvedValue(true);

      const token = await login('user@example.com', 'correctpassword');
      expect(typeof token).toBe('string');
      
      // Verifica o token usando jwt.verify
      const decoded = jwt.verify(token, 'seu_segredo_super_secreto');
      expect(decoded).toHaveProperty('id', fakeUser.id);
      expect(decoded).toHaveProperty('email', fakeUser.email);
    });
  });

  describe('verifyToken function', () => {
    it('deve retornar o payload decodificado se o token for válido', () => {
      const payload = { id: fakeUser.id, email: fakeUser.email };
      const validToken = jwt.sign(payload, 'seu_segredo_super_secreto', { expiresIn: '15m' });

      const decoded = verifyToken(validToken);
      expect(decoded).toHaveProperty('id', fakeUser.id);
      expect(decoded).toHaveProperty('email', fakeUser.email);
    });

    it('deve lançar erro se o token for inválido', () => {
      expect(() => verifyToken('invalidtoken')).toThrow('Token inválido');
    });
  });
});
