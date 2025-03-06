// LoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function LoginForm({ setError, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { refreshUser } = useAuth(); // Recupera a função para atualizar os dados do usuário

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        // Após o login, atualiza o contexto buscando os dados do usuário
        await refreshUser();
        // Opcionalmente, execute alguma ação adicional (como redirecionamento)
        if (onLoginSuccess) onLoginSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Erro no login');
      }
    } catch (err) {
      console.error('Erro durante o login:', err);
      setError('Erro durante o login');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default LoginForm;
