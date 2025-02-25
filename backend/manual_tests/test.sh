curl -i -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@example.com", "password": "senha1"}'


curl -i -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@example.com", "password": "senha2"}'

curl -X GET http://localhost:8080/summary -b "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIyMjIyMjIyLTIyMjItMjIyMi0yMjIyLTIyMjIyMjIyMjIyMiIsImVtYWlsIjoidXNlcjJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDA0MjAxMTQsImV4cCI6MTc0MDQyMTAxNH0.zw0SYtW618jGkP-X9sSU9AvN0_N5actmqKPY_oH4t5c"
