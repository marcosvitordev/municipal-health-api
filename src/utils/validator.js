function required(fields, body) {
  const miss = [];
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || body[f] === "")
      miss.push(f);
  }
  return miss;
}
module.exports = { required };
