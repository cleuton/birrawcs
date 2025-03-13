describe('Teste de Login e Dashboard via UI', () => {
  beforeEach(() => {
    // Limpa os cookies para garantir um estado limpo
    cy.clearCookies();
    // Visita a aplicação (substitua a URL se necessário)
    cy.visit('http://localhost:3000');
  });

  it('Deve realizar o login e exibir o Dashboard', () => {
    // Preenche o formulário de login
    cy.get('input[type="email"]').type('user1@example.com');
    cy.get('input[type="password"]').type('senha1');

    // Clica no botão de "Entrar"
    cy.get('button[type="submit"]').click();

    // Aguarda e valida que o Dashboard foi renderizado.
    // Pode-se usar um timeout maior caso o refreshUser demore a atualizar o estado.
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
  });
});
