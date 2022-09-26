const { isLiteralObject, isNonEmptyArray, clearArrays } = require('./internals')
const { pack } = require('./merging')

function * split (object) {
  if (isNonEmptyArray(object)) {
    for (const value of object) {
      for (const part of split(value)) {
        yield [part]
      }
    }
    return
  }
  if (isLiteralObject(object)) {
    let isNonSplittable = true
    const foundation = clearArrays(object)
    for (const [key, value] of Object.entries(object)) {
      for (const part of split(value)) {
        if (part === value) continue
        isNonSplittable = false
        yield { ...foundation, [key]: part }
      }
    }
    if (isNonSplittable) yield object
    return
  }
  yield object
}

function * splitAt (object, { capacity }) {
  yield * pack(split(object), { capacity })
}

module.exports = {
  split,
  splitAt
}
