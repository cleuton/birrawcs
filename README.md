# Cleuton Sampaio Consultoria

## Aplicação modelo 

- Para os cursos: **Frontend Studio - React** e **Backend Wiz**.

> **Nota**: O objetivo desta aplicação é servir de exemplo. Nem todos os casos de uso estão implementados, deixando essa tarefa a cargo do aluno.

## Para executar os testes

### Backend

```shell
cd backend 

npm test

npm run test:integration
```

### Frontend

```shell
cd ../frontend
npm test
```

selecione "a" para rodar todos os testes. Testes **E2E**:

```shell
npm run cypress:open
```

procurar a spec `cypress/e2e/app.cy.js` ou `cypress/e2e/login-dashboard.cy.js`. Executar. 

## Para executar a aplicação

### Subir o database

Você deve ter o **Docker** instalado. Execute o comando: 

```shell
docker run --name birradb -d \
  -p 27017:27017 \
  -v "$PWD/data:/data/db" \
  -v "$PWD/inicializacao.js:/docker-entrypoint-initdb.d/init.js" \
  mongo:latest
```

Para testar, abra um terminal e execute o **MongoSH**: 

```shell
docker exec -it birradb mongosh
```

Veja se as coleções foram preenchidas: 

```shell
use birradb;
db.notes.find().pretty();
db.users.find().pretty();
db.tasks.find().pretty();
```

Caso faça muitas alterações, recomendo resetar o database: 

```shell
# Remova completamente o contêiner do MongoDB: 
docker rm -f $(docker ps -q -a)

# Apague a pasta database/data
cd database
sudo rm -rf data
mkdir data
```

E rode novamente o comando **Docker** para criar o contêiner.

## Executar o backend

Vá para a pasta raiz do projeto e: 

```shell
cd backend
npm start
```

Se quiser rodar os testes manuais, abra o arquivo de comandos cURL: 

```shell
cd manual_test
gedit test.sh
```

Lembre-se de fazer `login` e copiar o token, colando-o no outro comando que quiser executar. 

## Frontend

Para executar o **frontend**, abra outro terminal e vá para a raiz do projeto, então: 

```shell
cd frontend
npm start
```




