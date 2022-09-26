const assert = require('assert')
const _ = require('lodash')
const { calculator } = require('../lib/internals')

const { generateRandomJson } = require('./utils')
const { normalize, denormalize, split, splitAt, merge, SplitError } = require('../lib')
const options = {
  capacity: 1024
}

function fuzz (bytes) {
  const object = generateRandomJson(bytes)
  const referenceObject = _.cloneDeep(object)

  const normalized = normalize(object)
  const denormalized = denormalize(normalized)
  assert.deepStrictEqual(denormalized, referenceObject)

  const referenceNormalized = _.cloneDeep(normalized)
  const merged = merge(Array.from(split(normalized)))
  assert.deepStrictEqual(merged, referenceNormalized)

  const acceptable = (err) => err instanceof SplitError && !err.message.includes('cannot merge')
  try {
    for (const part of splitAt(normalized, options)) {
      assert(calculator(part) <= options.capacity)
    }
  } catch (err) {
    if (!acceptable(err)) throw err
  }
}

module.exports = { fuzz, options }
