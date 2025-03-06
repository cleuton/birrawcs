// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função que busca os dados do usuário autenticado
  const refreshUser = () => {
    setLoading(true);
    fetch('/user', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => console.error('Erro no AuthContext:', err))
      .finally(() => setLoading(false));
  };

  // Executa refreshUser na montagem do componente
  useEffect(() => {
    refreshUser();
  }, []);

  // Função de login pode ser usada para atualizar o usuário se você já tiver os dados
  const login = (userData) => {
    setUser(userData);
  };

  // Função de logout (pode ser expandida conforme a necessidade)
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para facilitar o acesso ao AuthContext
export const useAuth = () => useContext(AuthContext);
