const bcrypt = require('bcrypt');

async function gerarHash() {
  const senha = "1234"; // senha em texto puro
  const saltRounds = 10; // número de iterações (quanto maior, mais seguro, mas mais lento)

  const hash = await bcrypt.hash(senha, saltRounds);
  console.log("Hash gerado:", hash);
}

gerarHash();
