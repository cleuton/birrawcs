import express from 'express';
import cookieParser from 'cookie-parser';

// Importa os routers das rotas
import loginRoutes from './routes/login.mjs';
import summaryRoutes from './routes/summary.mjs';
import notesRoutes from './routes/notes.mjs';
import tasksRoutes from './routes/tasks.mjs';
import taskListRoutes from './routes/taskList.mjs'; 

// Importa a função de conexão com o DB
import { connectDB } from './db.mjs';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

// Usa os routers importados
app.use(loginRoutes);
app.use(summaryRoutes);
app.use(notesRoutes);
app.use(tasksRoutes);
app.use(taskListRoutes); 

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});
