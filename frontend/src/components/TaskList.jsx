import React, { useState, useEffect } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('working'); // status padrão
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const pageSize = 10;

  const fetchTasks = () => {
    fetch(`/tasklist?status=${status}&page=${page}&pageSize=${pageSize}`, {
      credentials: 'include'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao buscar tarefas');
        }
        return response.json();
      })
      .then((data) => {
        setTasks(data.tasks);
        // Se o número de tarefas for igual ao pageSize, pode haver uma próxima página
        setHasMore(data.tasks.length === pageSize);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [status, page]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1); // reseta a página ao mudar o status
  };

  return (
    <div>
      <h2>Listar Tarefas</h2>
      <label htmlFor="status-select">Status:</label>
      <select id="status-select" value={status} onChange={handleStatusChange}>
        <option value="working">Trabalhando</option>
        <option value="completed">Concluída</option>
        <option value="pending">Pendente</option>
        <option value="suspended">Suspensa</option>
      </select>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            <strong>{task.title}</strong> - {task.status} - Prazo: {new Date(task.dueDate).toLocaleString()}
          </li>
        ))}
      </ul>
      <div>
        {page > 1 && (
          <button onClick={() => setPage(page - 1)}>Página Anterior</button>
        )}
        {hasMore && (
          <button onClick={() => setPage(page + 1)}>Próxima Página</button>
        )}
      </div>
    </div>
  );
}

export default TaskList;
