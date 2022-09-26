const _ = require('lodash')
const { suite, add, cycle, complete, save } = require('benny')
const { normalize: n, denormalize: d, split, splitAt, merge } = require('../lib')

const object = {
  coffee: 'arabica',
  beans: _.range(50).map((e) => ({ id: e, traits: ['delicious', 'great', 'energetic'] }))
}
const normalized = n(object)
const options = {
  capacity: 10 ** 6
}

suite(
  'sane normalization',

  add('normalization', () => {
    ;n(object)
  }),

  add('denormalization', () => {
    ;d(normalized)
  }),

  cycle(),
  complete(),
  save({ file: 'normalization', version: '1.0.0' }),
  save({ file: 'normalization', format: 'chart.html' })
)

suite(
  'sane splitting',

  add('full split & merge', () => {
    ;merge(Array.from(split(normalized)))
  }),

  add('splitAt & merge', () => {
    ;merge(Array.from(splitAt(normalized, options)))
  }),

  cycle(),
  complete(),
  save({ file: 'split', version: '1.0.0' }),
  save({ file: 'split', format: 'chart.html' })
)
