import React from 'react';

function NotesList({ notes }) {
  return (
    <div>
      <h2>Notas</h2>
      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            <strong>{new Date(note.datePosted).toLocaleString()}:</strong> {note.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesList;
