// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Summary from './Summary';
import Tasks from './Tasks';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Busca o resumo de tarefas
    fetch('/summary', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setSummary(data.summary))
      .catch((err) => {
        console.error('Erro ao buscar resumo:', err);
        setError('Erro ao buscar resumo');
      });

    // Busca as tarefas (segundo a lógica definida no backend)
    fetch('/tasks', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks))
      .catch((err) => {
        console.error('Erro ao buscar tarefas:', err);
        setError('Erro ao buscar tarefas');
      });
  }, []);

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Summary summary={summary} />
      <Tasks tasks={tasks} />
    </div>
  );
}

export default Dashboard;
