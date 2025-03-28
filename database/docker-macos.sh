sudo docker run --name birradb -d \
  -p 27017:27017 \
  -v "$PWD/data:/data/db" \
  -v "$PWD/inicializacao.js:/docker-entrypoint-initdb.d/init.js" \
  --user "$(id -u):$(id -g)" \
  mongo:latest