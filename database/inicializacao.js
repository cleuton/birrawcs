// Seleciona (ou cria) o database
db = db.getSiblingDB('birradb');

// Criação das collections (se ainda não existirem)
db.createCollection("users");
db.createCollection("tasks");

// Criação de índices para otimizar as buscas
// Índices para usuários: por id e email (únicos)
db.users.createIndex({ id: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

// Índices para tarefas: por id (único), owner e indexação textual no title para busca "like"
db.tasks.createIndex({ id: 1 }, { unique: true });
db.tasks.createIndex({ owner: 1 });
db.tasks.createIndex({ title: "text" });

// Inserção de dados iniciais

// Documentos de usuários
db.users.insertMany([
  {
    id: UUID("11111111-1111-1111-1111-111111111111"),
    email: "user1@example.com",
    hashpw: "abcdef1234567890" // hash da senha em hexadecimal
  },
  {
    id: UUID("22222222-2222-2222-2222-222222222222"),
    email: "user2@example.com",
    hashpw: "123456abcdef7890" // hash da senha em hexadecimal
  }
]);

// Documentos de tarefas
db.tasks.insertMany([
  {
    id: UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
    title: "Primeira Tarefa",
    description: "Descrição da primeira tarefa",
    completed: false,
    dueDate: ISODate("2023-11-05T18:00:00Z"),
    owner: UUID("11111111-1111-1111-1111-111111111111") // referência ao usuário 1
  },
  {
    id: UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
    title: "Segunda Tarefa",
    description: "Descrição da segunda tarefa",
    completed: true,
    dueDate: ISODate("2023-11-05T18:00:00Z"),
    owner: UUID("22222222-2222-2222-2222-222222222222") // referência ao usuário 2
  }
]);
