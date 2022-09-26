const deepmerge = require('deepmerge')
const { SplitError } = require('./errors')
const { calculator } = require('./internals')

function merge (parts) {
  return deepmerge.all(parts, {
    arrayMerge: (target, source, options) => {
      const destination = target.slice()
      source.forEach(({ i, v }) => {
        const destinationRef = destination.find((d) => d.i === i)
        if (!destinationRef) {
          destination.push({ i, v: options.cloneUnlessOtherwiseSpecified(v, options) })
        } else if (options.isMergeableObject(v)) {
          const targetRef = target.find((d) => d.i === i)
          destinationRef.v = deepmerge(targetRef.v, v, options)
        } else {
          throw new SplitError('cannot merge: ' + v)
        }
      })
      return destination
    }
  })
}

function * pack (parts, { capacity }) {
  let acc = null
  let counter = 0
  for (const part of parts) {
    counter += 1
    if (acc === null) {
      acc = part
      if (calculator(acc) > capacity) {
        throw new SplitError('#' + counter + ' part exceeds capacity')
      }
      continue
    }
    const candidate = merge([acc, part])
    if (calculator(candidate) < capacity) {
      acc = candidate
      continue
    }
    yield acc
    acc = part
    if (calculator(acc) > capacity) {
      throw new SplitError('#' + counter + ' part exceeds capacity')
    }
  }
  if (acc !== null) yield acc
}

module.exports = {
  merge,
  pack
}
