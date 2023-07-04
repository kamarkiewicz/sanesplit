const { BSON } = require('bson')

const isLiteralObject = (obj) => (!!obj) && (obj.constructor === Object)

const isNonEmptyArray = (obj) => Array.isArray(obj) && obj.length

const calculator = (object) => BSON.calculateObjectSize(object)

function clearArrays (object) {
  if (isNonEmptyArray(object)) return []
  if (isLiteralObject(object)) {
    return Object.entries(object).reduce((acc, [key, value]) => {
      acc[key] = clearArrays(value)
      return acc
    }, {})
  }
  return object
}

module.exports = {
  isLiteralObject,
  isNonEmptyArray,
  calculator,
  clearArrays
}
