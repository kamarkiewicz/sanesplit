const { SplitError } = require('./errors')
const { isLiteralObject, isNonEmptyArray } = require('./internals')

function normalize (object) {
  if (isNonEmptyArray(object)) {
    return object.map((value, index) => ({ i: index, v: normalize(value) }))
  }
  if (isLiteralObject(object)) {
    return Object.entries(object).reduce((acc, [key, value]) => {
      acc[key] = normalize(value)
      return acc
    }, {})
  }
  return object
}

function denormalize (object) {
  if (isNonEmptyArray(object)) {
    return object.reduce((acc, { i, v }) => {
      if (acc.length !== i) {
        throw new SplitError('object was not in normalized form')
      }
      acc.push(denormalize(v))
      return acc
    }, [])
  }
  if (isLiteralObject(object)) {
    return Object.entries(object).reduce((acc, [key, value]) => {
      acc[key] = denormalize(value)
      return acc
    }, {})
  }
  return object
}

module.exports = {
  normalize,
  denormalize
}
