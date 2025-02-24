// Seleciona (ou cria) o database
db = db.getSiblingDB('birradb');

// Criação das collections (se ainda não existirem)
db.createCollection("notes");
db.createCollection("users");
db.createCollection("tasks", 
  {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["status"],
        properties: {
          status: {
            enum: ["pending", "working", "completed", "suspended"],
            description: "Deve ser um dos valores: 'pending', 'working', 'completed', 'suspended'"
          }
        }
      }
    },
    validationLevel: "strict", // Opcional: define o nível de validação (strict ou moderate)
    validationAction: "error"  // Opcional: define a ação (error para rejeitar documentos inválidos)
  }
);

// Criação de índices para otimizar as buscas
db.notes.createIndex({ datePosted: -1 }, { unique: false });
db.users.createIndex({ id: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

db.tasks.createIndex({ id: 1 }, { unique: true });
db.tasks.createIndex({ owner: 1 });
db.tasks.createIndex({ title: "text" });

// Inserção de dados iniciais com senhas hasheadas

db.notes.insertMany([
  { datePosted: ISODate("2023-11-05T18:00:00Z"), text: "Primeira nota" },
  { datePosted: ISODate("2023-11-05T18:00:00Z"), text: "Segunda nota" }
]);

db.users.insertMany([
  {
    id: UUID("11111111-1111-1111-1111-111111111111"),
    email: "user1@example.com",
    // Hash da senha "senha1"
    hashpw: "$2b$10$sOW2i3nBT8ebmcNyjS6JReo0YxNhgEK.d7V6KPpRdxyz9Ez0.dBzy"
  },
  {
    id: UUID("22222222-2222-2222-2222-222222222222"),
    email: "user2@example.com",
    // Hash da senha "senha2"
    hashpw: "$2b$10$xZqaTLxwQWAG3D3vKQ9ZLerRRSOgGDFu5Fvpdp/zgrrB6Q6WVL/q6"
  }
]);

db.tasks.insertMany([
  {
    id: UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
    title: "Primeira Tarefa",
    description: "Descrição da primeira tarefa",
    status: "pending",
    dueDate: ISODate("2023-11-05T18:00:00Z"),
    requester: UUID("22222222-2222-2222-2222-222222222222"),
    owner: UUID("11111111-1111-1111-1111-111111111111")
  },
  {
    id: UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
    title: "Segunda Tarefa",
    description: "Descrição da segunda tarefa",
    status: "working",
    dueDate: ISODate("2023-11-05T18:00:00Z"),
    requester: UUID("11111111-1111-1111-1111-111111111111"),
    owner: UUID("22222222-2222-2222-2222-222222222222")
  }
]);
