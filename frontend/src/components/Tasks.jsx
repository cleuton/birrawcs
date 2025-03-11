// Tasks.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export function converteStatus(status) {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'working':
      return 'Em progresso';
    case 'completed':
      return 'Concluída';
    case 'suspended':
        return 'Suspensa';      
    default:
      return status;
  }
}

function Tasks({ tasks, comments }) {
  return (
    <div>
      <h2>Tarefas</h2>
      {tasks ? (
        tasks.length > 0 ? (
          <ul>
            {tasks.slice(0, 5).map((task, index) => (
              <li key={task.taskId}>
              <Link to={`/task/${task.id}`}>
                {task.title} - {converteStatus(task.status)}
              </Link>                
                <span>&nbsp; - {new Date(task.dueDate).toLocaleString('pt-BR')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma tarefa encontrada.</p>
        )
      ) : (
        <p>Carregando tarefas...</p>
      )}

      {/* Exibe "Últimos comentários" somente se houver comentários */}
      {comments && comments.length > 0 && (
        <div>
          <h2>Últimos comentários</h2>
          <ul>
            {comments.slice(0, 5).map((comment, index) => (
              <li key={comment.taskId}>
                <strong><Link to={`/task/${comment.taskId}`}>Abrir tarefa </Link></strong> - {comment.userName} -{' '}
                {new Date(comment.datePosted).toLocaleString('pt-BR')} - {comment.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Tasks;
