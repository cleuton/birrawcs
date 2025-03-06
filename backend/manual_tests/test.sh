curl -i -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@example.com", "password": "senha1"}'


curl -i -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@example.com", "password": "senha2"}'

curl -X GET http://localhost:8080/summary -b "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIyMjIyMjIyLTIyMjItMjIyMi0yMjIyLTIyMjIyMjIyMjIyMiIsImVtYWlsIjoidXNlcjJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDA0ODIyNDksImV4cCI6MTc0MDQ4MzE0OX0.dJskUdAmtDPAbkSBNIxF8b716t8I4G04p0F-2HpffjU"

curl -X GET http://localhost:8080/tasks -b "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIyMjIyMjIyLTIyMjItMjIyMi0yMjIyLTIyMjIyMjIyMjIyMiIsImVtYWlsIjoidXNlcjJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDA0ODQ2MjAsImV4cCI6MTc0MDQ4NTUyMH0.rgGDCEySGguIz-gU0FIyfEX3LeCLTWvGNxfnHW3Lmfo"

curl -i -X GET http://localhost:8080/taskList -b "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIyMjIyMjIyLTIyMjItMjIyMi0yMjIyLTIyMjIyMjIyMjIyMiIsImVtYWlsIjoidXNlcjJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDEyNjY3OTAsImV4cCI6MTc0MTI2NzY5MH0.hXqqZsaKxd8Oo99HtUHsEjymA1-IWl3Itt0nrBNr7ok"

curl -i -X GET "http://localhost:8080/taskList?status=working" -b "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIyMjIyMjIyLTIyMjItMjIyMi0yMjIyLTIyMjIyMjIyMjIyMiIsImVtYWlsIjoidXNlcjJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDEyNjY3OTAsImV4cCI6MTc0MTI2NzY5MH0.hXqqZsaKxd8Oo99HtUHsEjymA1-IWl3Itt0nrBNr7ok"