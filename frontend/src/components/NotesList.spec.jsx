import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotesList from './NotesList';

describe('NotesList component', () => {
    const sampleNotes = [
        { id: 1, text: 'First note' },
        { id: 2, text: 'Second note' },
        { id: 3, text: 'Third note' },
    ];

    test('renders without crashing', () => {
        render(<NotesList notes={sampleNotes} />);
        // Check if at least one note text appears in the document.
        expect(screen.getByText(/first note/i)).toBeInTheDocument();
    });

    test('renders all provided notes', () => {
        render(<NotesList notes={sampleNotes} />);
        sampleNotes.forEach(note => {
            expect(screen.getByText(note.text)).toBeInTheDocument();
        });
    });

    test('displays fallback message when no notes are provided', () => {
        render(<NotesList notes={[]} />);
        expect(screen.getByText(/Nenhuma nota disponível/i)).toBeInTheDocument();
    });

});