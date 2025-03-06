// TaskCrud.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TaskCrud = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtém os dados do usuário do contexto
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    dueDate: '',
    owner: '',
    attachment: '',
    comments: []
  });
  const [error, setError] = useState('');
  const [mode, setMode] = useState(id ? 'view' : 'create');

  useEffect(() => {
    if (id) {
      fetch(`/task/${id}`, { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error('Erro ao buscar tarefa');
          return res.json();
        })
        .then(data => {
          setTask(data);
          setFormData({
            title: data.title,
            description: data.description,
            status: data.status,
            dueDate: data.dueDate,
            owner: data.owner,
            attachment: data.attachment,
            comments: data.comments
          });
        })
        .catch(err => setError(err.message));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestOptions = {
      method: mode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    };

    fetch(mode === 'create' ? '/task' : `/task/${id}`, requestOptions)
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} tarefa`);
        return res.json();
      })
      .then(data => navigate(`/task/${data.id}`))
      .catch(err => setError(err.message));
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      fetch(`/task/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
        .then(res => {
          if (!res.ok) throw new Error('Erro ao excluir tarefa');
          navigate('/tasks');
        })
        .catch(err => setError(err.message));
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {mode === 'view' && task && (
        <div>
          <h2>{task.title}</h2>
          <p><strong>Descrição:</strong> {task.description}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Prazo:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
          <p><strong>Responsável:</strong> {task.owner}</p>
          {/* Verifica se o usuário existe e se sua role é admin */}
          {user && user.role === 'admin' && (
            <>
              <button onClick={() => setMode('edit')}>Editar</button>
              <button onClick={handleDelete}>Excluir</button>
            </>
          )}
        </div>
      )}
      {(mode === 'create' || mode === 'edit') && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Título"
            required
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição"
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="pendente">Pendente</option>
            <option value="em_progresso">Em Progresso</option>
            <option value="concluida">Concluída</option>
          </select>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
          <input
            type="text"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            placeholder="Responsável"
          />
          <button type="submit">
            {mode === 'create' ? 'Criar Tarefa' : 'Atualizar Tarefa'}
          </button>
        </form>
      )}
    </div>
  );
};

export default TaskCrud;
