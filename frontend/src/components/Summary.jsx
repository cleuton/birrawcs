import React from 'react';

function Summary({ summary }) {
  return (
    <div>
      <h2>Resumo de Tarefas</h2>
      {summary ? (
        <ul>
          <li>Pendente: {summary.pending}</li>
          <li>Em andamento: {summary.working}</li>
          <li>Concluída: {summary.completed}</li>
          <li>Suspensa: {summary.suspended}</li>
        </ul>
      ) : (
        <p>Carregando resumo...</p>
      )}
    </div>
  );
}

export default Summary;
