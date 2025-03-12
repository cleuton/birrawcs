describe('Teste E2E da Aplicação', () => {
    it('Deve exibir o título "Bem-vindo ao BirraApp" na página inicial', () => {
      // Substitua a URL abaixo pela URL da sua aplicação local
      cy.visit('http://localhost:3000');
      cy.contains('Bem-vindo ao BirraApp').should('be.visible');
    });

  });
  