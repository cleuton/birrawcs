import express from 'express';
import { MongoClient, Binary } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

// Conexão com o MongoDB
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let usersCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db('birradb');
    usersCollection = db.collection('users');
    console.log('Conectado ao MongoDB');
  } catch (err) {
    console.error('Erro ao conectar no MongoDB:', err);
  }
}

// Endpoint de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const match = await bcrypt.compare(password, user.hashpw);
    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      'seu_segredo_super_secreto',
      { expiresIn: '15m' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      // secure: true, // habilite em produção com HTTPS
      // sameSite: 'strict',
    });

    return res.json({ message: 'Login realizado com sucesso' });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de sumário das tarefas do usuário autenticado

app.get('/summary', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }

  try {
    // Verifica o token e extrai o payload
    const decoded = jwt.verify(token, 'seu_segredo_super_secreto');
    // Dentro da rota /summary, após decodificar o token:
    const userIdString = decoded.id; // Ex: "11111111-1111-1111-1111-111111111111"
    // Remove os traços e converte para Buffer:
    const userIdBuffer = Buffer.from(userIdString.replace(/-/g, ''), 'hex');
    // Cria um objeto Binary com o subtipo UUID:
    const binaryUserId = new Binary(userIdBuffer, Binary.SUBTYPE_UUID);

    // Acessa a coleção de tarefas (supondo que a conexão já esteja estabelecida)
    const tasksCollection = client.db('birradb').collection('tasks');

    // Pipeline de agregação para contar tarefas por status do usuário autenticado
    const pipeline = [
      { $match: { owner: binaryUserId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ];

    const results = await tasksCollection.aggregate(pipeline).toArray();

    // Define valores padrão para cada status
    const summary = {
      pending: 0,
      working: 0,
      completed: 0,
      suspended: 0
    };

    // Atualiza o sumário com os resultados da agregação
    results.forEach(item => {
      summary[item._id] = item.count;
    });

    return res.json({ summary });
  } catch (err) {
    console.error('Erro ao obter resumo:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
});

// Rota "/notes" para retornar as notas em ordem decrescente de "datePosted"

app.get('/notes', async (req, res) => {
  try {
    const notesCollection = client.db('birradb').collection('notes');
    const notes = await notesCollection.find({}).sort({ datePosted: -1 }).toArray();
    return res.json({ notes });
  } catch (err) {
    console.error('Erro ao buscar notas:', err);
    return res.status(500).json({ error: 'Erro interno do servidor ao buscar notas' });
  }
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});
