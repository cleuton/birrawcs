import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import NotesList from './components/NotesList';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notes, setNotes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  // Se não estiver autenticado, busca as notas
  useEffect(() => {
    if (!isAuthenticated) {
      fetch('/notes', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          // Supondo que o backend retorne as notas ordenadas ou você ordena no frontend
          // Exemplo: ordenando por datePosted de forma descendente:
          const sortedNotes = (data.notes || data).sort(
            (a, b) => new Date(b.datePosted) - new Date(a.datePosted)
          );
          setNotes(sortedNotes);
        })
        .catch((err) => {
          console.error('Erro ao buscar notas:', err);
          setError('Erro ao buscar notas');
        });
    }
  }, [isAuthenticated]);

  // Função para ser chamada após o login bem-sucedido
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetch('/summary', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setSummary(data.summary))
      .catch((err) => {
        console.error('Erro ao buscar resumo:', err);
        setError('Erro ao buscar resumo');
      });
  };

  return (
    <div className="App">
      <h1>Bem-vindo ao BirraApp</h1>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <>
          <NotesList notes={notes} />
          <LoginForm onLoginSuccess={handleLoginSuccess} setError={setError} />
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
