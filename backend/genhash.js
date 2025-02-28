import bcrypt from 'bcrypt';
console.log("senha1", bcrypt.hashSync("senha1", 10));
console.log("senha2", bcrypt.hashSync("senha2", 10));
console.log("senha3", bcrypt.hashSync("senha3", 10));
console.log("senha4", bcrypt.hashSync("senha4", 10));