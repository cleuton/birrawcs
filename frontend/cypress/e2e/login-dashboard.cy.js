describe('Teste de Login e Dashboard', () => {
    beforeEach(() => {
      // Limpa os cookies antes de cada teste para evitar interferências
      cy.clearCookies();
    });
  
    it('Deve logar e exibir o Dashboard', () => {
      // Realiza o login via API
      cy.request({
        method: 'POST',
        url: '/login', // URL relativa ao baseUrl configurado no Cypress
        body: {
          email: 'user1@example.com',
          password: 'senha1' // Use a senha correta para o usuário
        },
        // O Cypress vai armazenar os cookies de resposta, inclusive o httpOnly "token"
      }).then((response) => {
        expect(response.status).to.eq(200);
        // Aqui você pode validar outros aspectos da resposta, se necessário
      });
  
      // Visita a aplicação; o cookie httpOnly será enviado automaticamente
      cy.visit('/');
  
      // Aguarda e verifica que o Dashboard foi renderizado.
      // Por exemplo, verifica se existe o link "Dashboard" no menu
      cy.contains('Dashboard').should('be.visible');
  
      // Opcional: verifique se algum elemento específico do Dashboard está presente,
      // como parte do resumo ou alguma tarefa listada
      cy.get('h2').should('exist'); // Exemplo: valida que um título foi renderizado
    });
  });
  