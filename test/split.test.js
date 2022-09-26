const fs = require('fs')
const { options } = require('./split.fuzz')
const { calculator } = require('../lib/internals')
const { generateRandomJson } = require('./utils')
const {
  SplitError, normalize: n, denormalize: d, split, merge: m
} = require('../lib')
const s = (obj) => Array.from(split(obj, options))

describe('sane spliting', () => {
  test('non-splittable object', () => {
    const object = { a: 1, b: '2', d: { e: new Date(), [null]: null } }
    expect(n(object)).toStrictEqual(object)
    const parts = s(n(object))
    expect(parts).toStrictEqual([object])
    expect(m(parts)).toStrictEqual(n(object))
    expect(d(m(parts))).toStrictEqual(object)
  })

  test('array of atomic values', () => {
    const object = ['beans', 'water', null]
    const parts = s(n(object))
    expect(parts).toStrictEqual([
      [{ i: 0, v: 'beans' }],
      [{ i: 1, v: 'water' }],
      [{ i: 2, v: null }]
    ])
    expect(m(parts)).toStrictEqual(n(object))
    expect(d(m(parts))).toStrictEqual(object)
  })

  test('array with nested array', () => {
    const object = [{ a: [1, null] }]
    const parts = s(n(object))
    expect(parts).toStrictEqual([
      [{ i: 0, v: { a: [{ i: 0, v: 1 }] } }],
      [{ i: 0, v: { a: [{ i: 1, v: null }] } }]
    ])
    expect(m(parts)).toStrictEqual(n(object))
    expect(d(m(parts))).toStrictEqual(object)
  })

  test('shallow arrays', () => {
    const object = { coffee: ['beans', 'water', null] }
    const parts = s(n(object))
    expect(parts).toStrictEqual([
      { coffee: [{ i: 0, v: 'beans' }] },
      { coffee: [{ i: 1, v: 'water' }] },
      { coffee: [{ i: 2, v: null }] }
    ])
    expect(m(parts)).toStrictEqual(n(object))
    expect(d(m(parts))).toStrictEqual(object)
  })

  test('nested single array', () => {
    const object = { h: '', coffee: [{ a: [1, null] }] }
    const parts = s(n(object))
    expect(parts).toStrictEqual([
      { h: '', coffee: [{ i: 0, v: { a: [{ i: 0, v: 1 }] } }] },
      { h: '', coffee: [{ i: 0, v: { a: [{ i: 1, v: null }] } }] }
    ])
    expect(m(parts)).toStrictEqual(n(object))
    expect(d(m(parts))).toStrictEqual(object)
  })

  test('nested arrays', () => {
    const object = { h: '', items: [{ a: ['coffee', 2] }, { b: [null, 4] }] }
    const parts = s(n(object))
    expect(parts).toStrictEqual([
      { h: '', items: [{ i: 0, v: { a: [{ i: 0, v: 'coffee' }] } }] },
      { h: '', items: [{ i: 0, v: { a: [{ i: 1, v: 2 }] } }] },
      { h: '', items: [{ i: 1, v: { b: [{ i: 0, v: null }] } }] },
      { h: '', items: [{ i: 1, v: { b: [{ i: 1, v: 4 }] } }] }
    ])
    expect(m(parts)).toStrictEqual(n(object))
    expect(d(m(parts))).toStrictEqual(object)
  })

  test('shallow and nested array', () => {
    const object = {
      shallow: [null],
      nested: { array: [null] }
    }
    const parts = s(n(object))
    expect(parts).toStrictEqual([
      {
        shallow: [{ i: 0, v: null }],
        nested: { array: [] }
      },
      {
        shallow: [],
        nested: { array: [{ i: 0, v: null }] }
      }
    ])
    expect(m(parts)).toStrictEqual(n(object))
    expect(d(m(parts))).toStrictEqual(object)
  })
})

describe('invalid usage', () => {
  test('denormalize object which is not in normalized form', () => {
    const object = [0]
    expect(() => d(object)).toThrow(SplitError)
  })

  test('merge non-normalized parts', () => {
    const parts = [[{ i: 0, v: null }], [{ i: 0, v: null }]]
    expect(() => m(parts)).toThrow(SplitError)
  })
})

describe('fuzzing', () => {
  const crashCases = fs.readdirSync(__dirname)
    .filter(filename => filename.startsWith('crash-'))
    .map(filename => [filename, fs.readFileSync(filename)])
  for (const [filename, bytes] of crashCases) {
    test(filename, () => {
      const object = generateRandomJson(bytes)
      const parts = s(n(object))
      console.log(parts
        .filter(p => calculator(p) > options.capacity)
        .map(p => JSON.stringify(p))
        .join('\n'))
      const result = d(m(parts))
      expect(result).toStrictEqual(object)
    })
  }
})
