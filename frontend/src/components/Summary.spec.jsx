import React from 'react';
import { render, screen } from '@testing-library/react';
import Summary from './Summary';
import '@testing-library/jest-dom';

describe('Summary component', () => {
    test('renders loading message when summary prop is not provided', () => {
        render(<Summary />);
        expect(screen.getByText(/Carregando resumo/i)).toBeInTheDocument();
    });

    test('renders summary correctly when summary prop is provided', () => {
        const summaryData = {
            pending: 5,
            working: 3,
            completed: 7,
            suspended: 2
        };
        
        render(<Summary summary={summaryData} />);
        
        expect(screen.getByText(/Pendente: 5/i)).toBeInTheDocument();
        expect(screen.getByText(/Em andamento: 3/i)).toBeInTheDocument();
        expect(screen.getByText(/Concluída: 7/i)).toBeInTheDocument();
        expect(screen.getByText(/Suspensa: 2/i)).toBeInTheDocument();
    });
});