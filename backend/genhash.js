import bcrypt from 'bcrypt';
console.log(bcrypt.hashSync("senha1", 10));
console.log(bcrypt.hashSync("senha2", 10));