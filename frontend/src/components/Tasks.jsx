// Tasks.jsx
import React from 'react';

function Tasks({ tasks }) {
  return (
    <div>
      <h2>Tarefas</h2>
      {tasks ? (
        tasks.length > 0 ? (
          <ul>
            {tasks.map((task, index) => (
              <li key={index}>
                {task.title ? (
                  <>
                    <strong>{task.title}</strong> - {task.status} -{' '}
                    {new Date(task.dueDate).toLocaleString('pt-BR')}
                  </>
                ) : (
                  <>
                    {new Date(task.dueDate).toLocaleString('pt-BR')} - {task.status}
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma tarefa encontrada.</p>
        )
      ) : (
        <p>Carregando tarefas...</p>
      )}
    </div>
  );
}

export default Tasks;
