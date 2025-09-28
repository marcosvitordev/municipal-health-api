const bcrypt = require('bcrypt');

async function gerarHash() {
  const senha = '123456'; // senha que você quer para o admin
  const hash = await bcrypt.hash(senha, 10);
  console.log(hash);
}

gerarHash();
