// TaskCrud.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserSelect from "./UserSelect";
import { converteStatus } from './Tasks.jsx';

const TaskCrud = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtém os dados do usuário do contexto
  const [selectedUser, setSelectedUser] = useState(null); // Estado para armazenar o usuário selecionado
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    dueDate: '',
    owner: '',
    ownerUser: '',
    requester: '',
    requesterUser: '',
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
          setSelectedUser({
            value: data.owner,
            label: data.ownerUser
          });
          setFormData({
            title: data.title,
            description: data.description,
            status: data.status,
            dueDate: data.dueDate.split('T')[0] || '',
            owner: data.owner,
            ownerUser: data.ownerUser,
            requester: data.requester,
            requesterUser: data.requesterUser,
            attachment: data.attachment,
            comments: data.comments
          });
        })
        .catch(err => setError(err.message));
    }
  }, [id]);

  const handleUserSelect = (selectedOption) => {
    setSelectedUser(selectedOption);
    setFormData({
      ...formData,
      owner: selectedOption ? selectedOption.value : '',
      ownerUser: selectedOption ? selectedOption.label : ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.owner) {
      setError('Selecione um responsável');
      return;
    }

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
      .then(data => {
          if (mode === 'create') {
            navigate(`/dashboard`);
          } else {
            setMode('view');
            navigate(`/task/${id}`)  
          }
        })
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

  // Função para tratar a alteração do status da tarefa via PATCH
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    fetch(`/task/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao alterar status da tarefa');
        // Se o servidor retornar 204 (no content), atualizamos manualmente
        if (res.status === 204) {
          return { ...task, status: newStatus };
        }
        return res.json();
      })
      .then(updatedTask => {
        setTask(updatedTask);
        setFormData(prevData => ({ ...prevData, status: updatedTask.status }));
      })
      .catch(err => setError(err.message));
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {mode === 'view' && task && (
        <div>
          <h2>{task.title}</h2>
          <p><strong>Descrição:</strong> {task.description}</p>
          <p><strong>Status:</strong> {converteStatus(task.status)}</p>
          <p><strong>Prazo:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
          <p><strong>Demandante:</strong> {task.requesterUser}</p>
          <p><strong>Responsável:</strong> {task.ownerUser}</p>

          {/* Se o usuário for o responsável, exibe o select para alterar o status */}
          {user && user.userId === task.owner && (
            <div>
              <label htmlFor="statusSelect"><strong>Alterar status:</strong></label>
              <select id="statusSelect" value={task.status} onChange={handleStatusChange}>
                <option value="pending">Pendente</option>
                <option value="working">Em Progresso</option>
                <option value="completed">Concluída</option>
                <option value="suspended">Suspensa</option>
              </select>
            </div>
          )}

          {/* Botões para administrador */}
          {user && user.role === 'admin' && (
            <>
              <button onClick={() => setMode('edit')}>Editar</button>
              <button onClick={handleDelete}>Excluir</button>
            </>
          )}
        </div>
      )}
      {(mode === 'create' || mode === 'edit') && (
        <div className="task-form-container">
          <form onSubmit={handleSubmit} className="task-form">
            <div className='form-group'>
              <label htmlFor="title">Título</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição"
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pendente</option>
                <option value="working">Em Progresso</option>
                <option value="completed">Concluída</option>
                <option value="suspended">Suspensa</option>
              </select>
            </div> 
            <div className="form-group">
              <label htmlFor="dueDate">Prazo</label>                         
              <input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Responsável</label>            
              <UserSelect 
                value={selectedUser} 
                onChange={handleUserSelect} 
              />          
            </div>
            <div className="form-group">
              <button type="submit">
                {mode === 'create' ? 'Criar Tarefa' : 'Atualizar Tarefa'}
              </button>
              <button type="button" onClick={() => navigate('/dashboard')}
                className="cancel-button">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskCrud;
