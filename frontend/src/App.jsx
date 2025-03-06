import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import NotesList from './components/NotesList';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import TaskCrud from './components/TaskCrud';
import { jwtDecode } from 'jwt-decode';
import './App.css';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
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
  const handleLoginSuccess = async () => {
    try {
      const response = await fetch('/user', { credentials: 'include' });
      if (!response.ok) throw new Error('Falha ao obter dados do usuário');
      
      const userData = await response.json();      
      setUserRole(userData.role);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      // Trate o erro (ex: redirecione para login)
    }
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
            {/* Dashboard */}
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>

            {/* Notas */}
            <li>
              <Link to="/notes">Notas</Link>
            </li>

            {/* Tarefas com submenu condicional */}
            <li className="nav-item">
              Tarefas
              <ul className="nav-submenu">
                {/* Listar tarefas (visível para todos usuários autenticados) */}
                <li>
                  <Link to="/tasks">Listar</Link>
                </li>

                {/* Criar tarefa (apenas para admins) */}
                {userRole === 'admin' && (
                  <li>
                    <Link to="/task/new">Criar Tarefa</Link>
                  </li>
                )}
              </ul>
            </li>

            {/* Botão de logout */}
            <li>
              <button
                onClick={handleLogout}
                className="logout-button"
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
        <Route path="/task/new" element={<TaskCrud />} />
        <Route path="/task/:id" element={<TaskCrud />} />
        <Route path="/tasks" element={<TaskList />} />        
      </Routes>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
