// Seleciona (ou cria) o database
db = db.getSiblingDB('birradb');

// Criação das collections (se ainda não existirem)
db.createCollection("notes");
db.createCollection("users");

// Criação da collection "tasks" com validação estendida para incluir o array de "comments"
db.createCollection("tasks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["status"],
      properties: {
        status: {
          enum: ["pending", "working", "completed", "suspended"],
          description: "Deve ser um dos valores: 'pending', 'working', 'completed', 'suspended'"
        },
        // Campo opcional que armazena os comentários embutidos
        comments: {
          bsonType: "array",
          description: "Array de comentários para a tarefa",
          items: {
            bsonType: "object",
            required: ["userName", "datePosted", "text", "viewed"],
            properties: {
              userName: {
                bsonType: "string",
                description: "Nome do usuário que fez o comentário"
              },
              datePosted: {
                bsonType: "date",
                description: "Data e hora em que o comentário foi postado"
              },
              text: {
                bsonType: "string",
                description: "Conteúdo do comentário"
              },
              viewed: {
                bsonType: "bool",
                description: "Indica se o comentário foi visualizado"
              }
            }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// Criação de índices para otimizar as buscas
db.notes.createIndex({ datePosted: -1 }, { unique: false });
db.users.createIndex({ id: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

db.tasks.createIndex({ id: 1 }, { unique: true });
db.tasks.createIndex({ owner: 1 });
db.tasks.createIndex({ title: "text" });
// Índice para facilitar a busca de comentários não visualizados e ordenados por data
db.tasks.createIndex({ "comments.viewed": 1, "comments.datePosted": -1 });

// Inserção de dados iniciais com senhas hasheadas

db.notes.insertMany([
  { datePosted: ISODate("2023-11-05T18:00:00Z"), text: "Primeira nota" },
  { datePosted: ISODate("2023-11-05T18:00:00Z"), text: "Segunda nota" }
]);

db.users.insertMany([
  {
    id: UUID("11111111-1111-1111-1111-111111111111"),
    email: "user1@example.com",
    name: "Usuário 1",
    // Hash da senha "senha1"
    hashpw: "$2b$10$sOW2i3nBT8ebmcNyjS6JReo0YxNhgEK.d7V6KPpRdxyz9Ez0.dBzy",
    admin: true
  },
  {
    id: UUID("22222222-2222-2222-2222-222222222222"),
    email: "user2@example.com",
    name: "Usuário 2",
    // Hash da senha "senha2"
    hashpw: "$2b$10$xZqaTLxwQWAG3D3vKQ9ZLerRRSOgGDFu5Fvpdp/zgrrB6Q6WVL/q6",
    admin: false
  }
]);

db.tasks.insertMany([
  {
    id: UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
    title: "Primeira Tarefa",
    description: "Descrição da primeira tarefa",
    status: "completed",
    dueDate: ISODate("2023-11-05T18:00:00Z"),
    requester: UUID("11111111-1111-1111-1111-111111111111"),
    owner: UUID("22222222-2222-2222-2222-222222222222"),
    attachment: "",
    comments: [] 
  },
  {
    id: UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
    title: "Segunda Tarefa",
    description: "Descrição da segunda tarefa",
    status: "working",
    dueDate: ISODate("2025-02-28T18:00:00Z"),
    requester: UUID("11111111-1111-1111-1111-111111111111"),
    owner: UUID("22222222-2222-2222-2222-222222222222"),
    attachment: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb-arquivo.pdf",
    comments: [{"userName": "Usuário 1", "datePosted": ISODate("2025-02-05T10:00:00Z")
      , "text": "Lembre-se de atualizar o database!", "viewed": false}] 
  }
]);
