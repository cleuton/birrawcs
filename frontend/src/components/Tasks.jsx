// Tasks.jsx
import React from 'react';

function Tasks({ tasks, comments }) {
  return (
    <div>
      <h2>Tarefas</h2>
      {tasks ? (
        tasks.length > 0 ? (
          <ul>
            {tasks.slice(0, 5).map((task, index) => (
              <li key={index}>
                <strong>{task.title}</strong> - {task.status} -{' '}
                {new Date(task.dueDate).toLocaleString('pt-BR')}
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
              <li key={index}>
                <strong>Task ID: {comment.taskId}</strong> - {comment.userName} -{' '}
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
