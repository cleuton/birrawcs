import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import NotesList from './components/NotesList';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import './App.css';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Se não estiver autenticado, busca as notas
  useEffect(() => {
    if (!isAuthenticated) {
      fetch('/notes', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
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

  // Função chamada após login bem-sucedido
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Função para logout: limpa o cookie e redireciona para a home
  const handleLogout = () => {
    // Limpa o cookie "token"
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsAuthenticated(false);
    navigate('/'); // redireciona para a rota raiz
  };

  return (
    <div className="App">
      <h1>Bem-vindo ao BirraApp</h1>
      {isAuthenticated && (
        <nav>
          <ul>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/notes">Notas</Link>
            </li>
            <li>
              Tarefas
              <ul>
                <li>
                  <Link to="/tarefas/listar">Listar</Link>
                </li>
              </ul>
            </li>
            <li>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'blue',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Sair
              </button>
            </li>
          </ul>
        </nav>
      )}

      <Routes>
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <p>Acesso não autorizado. Faça login para acessar o Dashboard.</p>
            )
          }
        />
        <Route path="/notes" element={<NotesList notes={notes} />} />
        <Route
          path="/tarefas/listar"
          element={
            isAuthenticated ? (
              <TaskList />
            ) : (
              <p>Acesso não autorizado. Faça login para ver as tarefas.</p>
            )
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <>
                <NotesList notes={notes} />
                <LoginForm onLoginSuccess={handleLoginSuccess} setError={setError} />
              </>
            )
          }
        />
      </Routes>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
