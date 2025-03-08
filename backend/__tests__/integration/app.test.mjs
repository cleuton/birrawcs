// __tests__/integration/app.test.mjs
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

// Importe as rotas conforme sua estrutura
import loginRouter from '../../routes/login.mjs';
import notesRouter from '../../routes/notes.mjs';
import summaryRouter from '../../routes/summary.mjs';
import tasksRouter from '../../routes/tasks.mjs';
import taskListRouter from '../../routes/taskList.mjs'; 
import taskCrudRoutes from '../../routes/taskCrud.mjs';
import userRoutes from '../../routes/user.mjs';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/', loginRouter);
app.use('/', notesRouter);
app.use('/', summaryRouter);
app.use('/', tasksRouter);
app.use('/', taskListRouter); 
app.use('/', taskCrudRoutes);
app.use('/', userRoutes);


let server;
const openSockets = new Set();

// Substituímos o uso de (done) por uma Promise/async
beforeAll(async () => {
  // Inicia o servidor em uma porta dinâmica (0) e aguarda a conclusão
  server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  // Monitora todas as conexões
  server.on('connection', (socket) => {
    openSockets.add(socket);
    socket.on('close', () => {
      openSockets.delete(socket);
    });
  });
});

afterAll(async () => {
  // 1. Fecha todos os sockets abertos
  for (const socket of openSockets) {
    socket.destroy();
  }

  // 2. Fecha o servidor
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe('Integração - API REST', () => {
  // Ajuste conforme o usuário que exista no seu ambiente de teste
  const validUser = {
    email: 'user2@example.com',
    password: 'senha2',
  };

  describe('POST /login', () => {
    it('deve retornar 400 se email ou senha não forem fornecidos', async () => {
      const res = await request(server)
        .post('/login')
        .send({ email: '', password: '' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('deve autenticar e definir cookie se as credenciais forem válidas', async () => {
      const res = await request(server)
        .post('/login')
        .send(validUser);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Login realizado com sucesso');
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  describe('GET /notes', () => {
    it('deve retornar as notas cadastradas', async () => {
      const res = await request(server).get('/notes');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('notes');
      expect(Array.isArray(res.body.notes)).toBe(true);
    });
  });

  describe('GET /summary', () => {
    it('deve retornar 401 se o token não for fornecido', async () => {
      const res = await request(server).get('/summary');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Acesso não autorizado');
    });

    it('deve retornar o resumo se o token for válido', async () => {
      const loginRes = await request(server)
        .post('/login')
        .send(validUser);
      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();     

      const res = await request(server)
        .get('/summary')
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('summary');
    });
  });

  describe('GET /tasks', () => {
    it('deve retornar 401 se o token não for fornecido', async () => {
      const res = await request(server).get('/tasks');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Acesso não autorizado');
    });

    it('deve retornar tasks e comments se o token for válido', async () => {
      const loginRes = await request(server)
        .post('/login')
        .send(validUser);
      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();  

      const res = await request(server)
        .get('/tasks')
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tasks');
      expect(res.body).toHaveProperty('comments');
    });
  });

  describe('GET /tasklist', () => {
    it('deve retornar 401 se o token não for fornecido', async () => {
      const res = await request(server).get('/tasklist');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Acesso não autorizado');
    });

    it('deve retornar tasks filtradas por status se o token for válido', async () => {

      const validUser = {
        email: 'user2@example.com',
        password: 'senha2',
      };

      const loginRes = await request(server)
        .post('/login')
        .send(validUser);

       
      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const res = await request(server)
        .get('/tasklist')
        .query({ status: 'working' })
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tasks');
      expect(Array.isArray(res.body.tasks.tasks)).toBe(true);
      expect(res.body.tasks.tasks.length).toBeGreaterThan(0);
      expect(res.body.tasks.tasks[0]).toHaveProperty('status', 'working');
    });

    it('deve retornar tasks paginadas se o token for válido', async () => {

      const validUser = {
        email: 'user2@example.com',
        password: 'senha2',
      };

      const loginRes = await request(server)
        .post('/login')
        .send(validUser);
      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const res = await request(server)
        .get('/tasklist')
        .query({ page: 1, pageSize: 1 })
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tasks');
      expect(Array.isArray(res.body.tasks.tasks)).toBe(true);
      expect(res.body.tasks.tasks.length).toBe(1);
    });
  });
  // Tarefas

  describe('CRUD de Tarefas', () => {
    let userToken;
    let adminToken;
    let taskIdTeste;
  
    beforeAll(async () => {
      // Autenticação do usuário regular (user2)
      const userRes = await request(server)
        .post('/login')
        .send(validUser);
      userToken = userRes.headers['set-cookie'];
  
      // Autenticação do admin (user1)
      const adminRes = await request(server)
        .post('/login')
        .send({ email: 'user1@example.com', password: 'senha1' });
      adminToken = adminRes.headers['set-cookie'];
    });
  
    it('POST /task - deve criar tarefa com dados válidos', async () => {
      const novaTarefa = {
        title: 'Tarefa Teste',
        description: 'Descrição da tarefa de teste',
        status: 'pending',
        dueDate: new Date().toISOString(),
        owner: '22222222-2222-2222-2222-222222222222',
      };
  
      const res = await request(server)
        .post('/task')
        .set('Cookie', userToken)
        .send(novaTarefa)
        .expect(201);
  
      taskIdTeste = res.body.id; // Agora é uma string UUID válida
      expect(res.body.title).toBe(novaTarefa.title);
      expect(res.body.status).toBe(novaTarefa.status);
    });
  
    it('GET /task/:id - deve retornar tarefa existente', async () => {
      const res = await request(server)
        .get(`/task/${taskIdTeste}`) // Usa UUID string
        .set('Cookie', userToken)
        .expect(200);
  
      expect(res.body.title).toBe('Tarefa Teste');
      expect(res.body.owner).toBeDefined();
    });
  
    it('PUT /task/:id - deve atualizar tarefa', async () => {
      const result1 = await request(server)
        .get(`/task/${taskIdTeste}`) // Usa UUID string
        .set('Cookie', adminToken)
        .expect(200);      
      result1.body.status = 'completed';    
      const res = await request(server)
        .put(`/task/${taskIdTeste}`)
        .set('Cookie', adminToken)
        .send(result1.body)
        .expect(200);
  
      expect(res.body.status).toBe('completed');
    });
  
    it('DELETE /task/:id - deve excluir tarefa', async () => {
      const novaTarefa = {
        title: 'Tarefa Teste exclusão',
        description: 'Descrição da tarefa de teste',
        status: 'pending',
        dueDate: new Date().toISOString(),
        owner: '22222222-2222-2222-2222-222222222222',
      };
  
      const res = await request(server)
        .post('/task')
        .set('Cookie', userToken)
        .send(novaTarefa)
        .expect(201);
  
      taskIdTeste = res.body.id;      
      console.log("##### Id Tarefa para excluir:", taskIdTeste);
      await request(server)
        .delete(`/task/${taskIdTeste}`)
        .set('Cookie', adminToken)
        .expect(204);
  
      await request(server)
        .get(`/task/${taskIdTeste}`)
        .set('Cookie', adminToken)
        .expect(404);
    });
  });

  // Usuários
  describe('GET /user', () => {
    it('deve retornar 401 se o token não for fornecido', async () => {
      const res = await request(server).get('/user');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Não autenticado');
    });

    it('deve retornar o usuário se o token for válido', async () => {
      const loginRes = await request(server)
        .post('/login')
        .send(validUser);
      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const res = await request(server)
        .get('/user')
        .set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('role');
      expect(res.body).toHaveProperty('userId');
    });
  });

  describe('GET /user/:id/detail', () => {
    it('deve retornar 401 se o token não for fornecido', async () => {
      const res = await request(server).get('/user/12345678/detail');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Não autenticado');
    });
   
    it('deve retornar os detalhes do usuário se o token for válido', async () => {
      const loginRes = await request(server)
        .post('/login')
        .send(validUser);
      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const validUser2 = {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'user2@example.com',
        password: 'senha2',
      };
      const res = await request(server)
        .get(`/user/${validUser2.id}/detail`)
        .set('Cookie', cookies);

console.log("##### Resposta:", res.body);        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', validUser.email);
    });
  });
});



