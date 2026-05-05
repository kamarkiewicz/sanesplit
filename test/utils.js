const seedrandom = require('seedrandom')
const randomJson = require('node-random-json')({
  types: ['Object', 'Array', 'Date', 'String', 'Number', 'Boolean', 'Null', 'Undefined'],
  maxDepth: 5,
  minStrLen: 0,
  maxStrLen: 20,
  minArraySize: 0,
  maxArraySize: 5,
  minObjectSize: 0,
  maxObjectSize: 10,
  maxAbsNumber: 2000000
})

function generateRandomJson (bytes) {
  const seed = Buffer.from(bytes).toString('base64')
  seedrandom(seed, { global: true })
  return randomJson('Object')
}

module.exports = {
  generateRandomJson
}
