import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('working');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const pageSize = 10;

  const fetchTasks = () => {
    setError(''); // Limpa erro anterior
    fetch(`/tasklist?status=${status}&page=${page}&pageSize=${pageSize}`, {
      credentials: 'include'
    })
      .then((response) => {
        if (!response.ok) throw new Error('Erro ao buscar tarefas');
        return response.json();
      })
      .then((data) => {
        setTasks(Array.isArray(data.tasks.tasks) ? data.tasks.tasks : []); // Ensure tasks is an array
        setTotalPages(data.tasks.totalPages); // Adjusted to match the provided JSON structure
        console.log('Tarefas carregadas:', tasks); // Verifique se os IDs estão presentes
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
    setPage(1); // Reseta página ao mudar status
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <h2>Listar Tarefas</h2>
      
      {/* Controles de paginação */}
      <div style={{ marginBottom: '20px' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => handlePageChange(num)}
            disabled={num === page}
            style={{
              margin: '0 5px',
              fontWeight: num === page ? 'bold' : 'normal',
              cursor: num === page ? 'default' : 'pointer'
            }}
          >
            {num}
          </button>
        ))}
      </div>

      <label htmlFor="status-select">Status:</label>
      <select id="status-select" value={status} onChange={handleStatusChange}>
        <option value="working">Trabalhando</option>
        <option value="completed">Concluída</option>
        <option value="pending">Pendente</option>
        <option value="suspended">Suspensa</option>
      </select>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <Link to={`/task/${task.id}`}>
              {task.title} - {task.status}
            </Link>
            <span>&nbsp; Prazo: {new Date(task.dueDate).toLocaleString()}</span>
          </li>
        ))}
      </ul>

      <div>
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Página Anterior
        </button>
        
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Próxima Página
        </button>
      </div>
    </div>
  );
}

export default TaskList;