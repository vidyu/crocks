const test = require('tape')

const isFunction = require('../core/isFunction')
const isInteger = require('../core/isNil')

test('isInteger predicate', t => {
  t.ok(isFunction(isInteger), 'is a function')
  t.end()
})
