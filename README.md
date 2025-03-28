# Cleuton Sampaio Consultoria

# Aplicação modelo 

- Para os cursos: **Frontend Studio - React** e **Backend Wiz**.
- Clone o [**repositório**](https://github.com/cleuton/birrawcs) do projeto. 

> **Nota**: O objetivo desta aplicação é servir de exemplo. Nem todos os casos de uso estão implementados, deixando essa tarefa a cargo do aluno.

# Como instalar a plataforma de software

A seguir, um guia simples para instalar **Node.js**, **npm**, **npx** e **Docker** nos sistemas Ubuntu, Windows e MacOS.

## Ubuntu

### Node.js, npm e npx

1. **Atualize os repositórios:**
   ```bash
   sudo apt update
   ```
2. **Instale o Node.js:**
   ```bash
   sudo apt install nodejs
   ```
3. **Verifique a instalação do Node.js:**
   ```bash
   node -v
   ```
4. **Instale o npm:**
   ```bash
   sudo apt install npm
   ```
5. **Verifique a versão do npm:**
   ```bash
   npm -v
   ```
6. **Sobre o npx:**  
   O `npx` já vem incluído a partir do npm versão 5.2. Se estiver usando uma versão inferior, você pode instalá-lo globalmente:
   ```bash
   sudo npm install -g npx
   ```

### Docker

1. **Remova versões antigas (se houver):**
   ```bash
   sudo apt remove docker docker-engine docker.io containerd runc
   ```
2. **Instale os pacotes necessários para repositórios HTTPS:**
   ```bash
   sudo apt update
   sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release
   ```
3. **Adicione a chave GPG oficial do Docker:**
   ```bash
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   ```
4. **Configure o repositório estável do Docker:**
   ```bash
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```
5. **Atualize o apt e instale o Docker:**
   ```bash
   sudo apt update
   sudo apt install docker-ce docker-ce-cli containerd.io
   ```
6. **Teste a instalação:**
   ```bash
   sudo docker run hello-world
   ```
7. **(Opcional) Permita executar o Docker sem `sudo`:**
   ```bash
   sudo usermod -aG docker $USER
   ```
   Em seguida, faça logout e login novamente para as alterações terem efeito.

## MS Windows

### Node.js, npm e npx

1. **Baixe o instalador:**  
   Acesse o site oficial [nodejs.org](https://nodejs.org/) e baixe a versão LTS (Long Term Support).

2. **Instale o Node.js:**  
   Execute o instalador e siga as instruções na tela.  
   *(O npm já é instalado junto com o Node.js e o npx vem incluído a partir do npm 5.2.)*

3. **Verifique a instalação:**  
   Abra o **Prompt de Comando** ou **PowerShell** e execute:
   ```cmd
   node -v
   npm -v
   ```

### Docker

1. **Baixe o Docker Desktop:**  
   Visite [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop) e faça o download do instalador.

2. **Instale o Docker Desktop:**  
   Execute o instalador e siga as instruções fornecidas.

3. **Verifique a instalação:**  
   Após a configuração, abra o **Prompt de Comando** ou **PowerShell** e execute:
   ```cmd
   docker run hello-world
   ```

> **Observação:** O Docker Desktop para Windows exige o Windows 10 Pro ou Enterprise, pois utiliza o Hyper-V para virtualização.

## MacOS

### Node.js, npm e npx

1. **Baixe o instalador:**  
   Acesse [nodejs.org](https://nodejs.org/) e baixe a versão LTS para MacOS, ou...

2. **(Alternativa com Homebrew):**  
   Se você tiver o [Homebrew](https://brew.sh/) instalado, abra o **Terminal** e execute:
   ```bash
   brew install node
   ```

3. **Verifique a instalação:**  
   No Terminal, execute:
   ```bash
   node -v
   npm -v
   ```
   *(O npx já vem incluso com versões recentes do npm.)*

### Docker

1. **Baixe o Docker Desktop:**  
   Visite [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop) e baixe o instalador.

2. **Instale o Docker Desktop:**  
   Abra o arquivo baixado e arraste o ícone do Docker para a pasta **Aplicativos**.

3. **(Alternativa com Homebrew):**  
   No Terminal, você também pode instalar via Homebrew:
   ```bash
   brew install --cask docker
   ```
4. **Verifique a instalação:**  
   Após iniciar o Docker Desktop, abra o Terminal e execute:
   ```bash
   docker run hello-world
   ```

# Para executar os testes

## Backend

```shell
cd backend 

npm install # Só na primeira vez após clonar o repositório

npm test

npm run test:integration
```

## Frontend

```shell
cd ../frontend

npm install # Só na primeira vez que clonar o repositório

npm test
```

selecione "a" para rodar todos os testes. Testes **E2E**: (O frontend e o backend precisam estar rodando)

```shell
npm run cypress:open
```

procurar a spec `cypress/e2e/app.cy.js` ou `cypress/e2e/login-dashboard.cy.js`. Executar. 

# Para executar a aplicação

## Subir o database

Você deve ter o **Docker** instalado. Execute o comando: 

```shell
cd database
mkdir data
docker run --name birradb -d \
  -p 27017:27017 \
  -v "$PWD/data:/data/db" \
  -v "$PWD/inicializacao.js:/docker-entrypoint-initdb.d/init.js" \
  mongo:latest
```

Se estiver usando `macos`: 
```shell
sudo docker run --name birradb -d \
  -p 27017:27017 \
  -v "$PWD/data:/data/db" \
  -v "$PWD/inicializacao.js:/docker-entrypoint-initdb.d/init.js" \
  --user "$(id -u):$(id -g)" \
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

npm install # Só na primeira vez que clonar o repositório

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




