import React from 'react';


function NotesList({ notes }) {
  return (
    <div>
      <h2>Notas</h2>
      {notes.length === 0 ? (<li>Nenhuma nota disponível</li>)
      : (
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <strong>{new Date(note.datePosted).toLocaleString()}:</strong> {note.text}
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}

export default NotesList;
