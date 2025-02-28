import { getDB } from '../db.mjs';
import { verifyToken } from './authService.mjs';
import { Binary } from 'mongodb';

export async function getTasks(token, statusFilter, page = 1, pageSize = 10) {
  const db = getDB();
  const usersCollection = db.collection('users');
  const tasksCollection = db.collection('tasks');

  // Verifica o token e obtém o ID do usuário
  const decoded = verifyToken(token);
  const userId = decoded.id;

  // Converte a string em Binary (UUID)
  const userIdBuffer = Buffer.from(userId.replace(/-/g, ''), 'hex');
  const binaryUserId = new Binary(userIdBuffer, Binary.SUBTYPE_UUID);
  
  // Obtém o usuário para verificar se é admin
  const user = await usersCollection.findOne({ id: binaryUserId });
  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  // Define o campo de filtro com base no tipo de usuário
  const filterField = user.admin ? 'requester' : 'owner';

  // Constrói o filtro de status
  const statusQuery = statusFilter ? { status: statusFilter } : {};

  // Constrói a consulta principal
  const query = {
    [filterField]: binaryUserId,
    ...statusQuery
  };

  // Calcula o total de registros para paginação
  const total = await tasksCollection.countDocuments(query);
  const totalPages = Math.ceil(total / pageSize);

  // Constrói a projeção para obter os campos desejados
  const projection = {
    title: 1,
    status: 1,
    dueDate: 1,
    requester: 1,
    owner: 1
  };

  // Obtém as tarefas paginadas e ordenadas
  const tasks = await tasksCollection.find(query)
    .project(projection)
    .sort({ dueDate: -1 })
    .skip((page - 1) * pageSize)
    .limit(parseInt(pageSize))
    .toArray();

  // Obtém os nomes dos usuários requisitantes e proprietários
  const userIds = tasks.flatMap(task => [task.requester, task.owner]);
  const usersMap = await usersCollection.find({ _id: { $in: userIds } })
    .project({ name: 1 })
    .toArray()
    .then(users => users.reduce((map, user) => {
      map[user._id.toString()] = user.name;
      return map;
    }, {}));

  // Mapeia os nomes dos usuários nas tarefas
  const resultTasks = tasks.map(task => ({
    title: task.title,
    status: task.status,
    dueDate: task.dueDate,
    requestedBy: usersMap[task.requester.toString()],
    ownedBy: usersMap[task.owner.toString()]
  }));

  return {
    tasks: resultTasks,
    totalPages: totalPages
  };
}