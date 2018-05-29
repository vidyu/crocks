/** @license ISC License (c) copyright 2018 original and current authors */
/** @author Karthik Iyengar (karthikiyengar) */

const VERSION = 1

const _implements = require('../core/implements')
const _equals = require('../core/equals')
const _inspect = require('../core/inspect')
const _type = require('../core/types').type('Tuple')
const typeString = require('../core/types').typeFn(_type(), VERSION)
const fl = require('../core/flNames')

const isFunction = require('../core/isFunction')
const isInteger = require('../core/isInteger')
const isSameType = require('../core/isSameType')
const isSemigroup = require('../core/isSemigroup')

const constant = x => () => x

function _Tuple(n) {
  /* eslint-disable no-unused-vars */
  switch (n) {
  case 1: return function(a) { return Tuple(n, arguments) }
  case 2: return function(a, b) { return Tuple(n, arguments) }
  case 3: return function(a, b, c) { return Tuple(n, arguments) }
  case 4: return function(a, b, c, d) { return Tuple(n, arguments) }
  case 5: return function(a, b, c, d, e) { return Tuple(n, arguments) }
  case 6: return function(a, b, c, d, e, f) { return Tuple(n, arguments) }
  case 7: return function(a, b, c, d, e, f, g) { return Tuple(n, arguments) }
  case 8: return function(a, b, c, d, e, f, g, h) { return Tuple(n, arguments) }
  case 9: return function(a, b, c, d, e, f, g, h, i) { return Tuple(n, arguments) }
  case 10: return function(a, b, c, d, e, f, g, h, i, j) { return Tuple(n, arguments) }
  default:
    throw new TypeError(
      'Tuple: Tuple size should be a number between 1 and 10'
    )
  }
  /* eslint-enable no-unused-vars */

  function Tuple(n, [ ...parts ]) {
    if (n !== parts.length) {
      throw new TypeError(
        `${n}-Tuple: Expected ${n} values, but got ${parts.length}`
      )
    }

    const inspect =
      () => `Tuple(${parts.map(_inspect).join(',')} )`

    const type =
      constant(`${n}-${_type()}`)

    function map(method) {
      return function(fn) {
        if (!isFunction(fn)) {
          throw new TypeError(`${n}-Tuple.${method}: Function required`)
        }

        return Tuple(n, parts
          .slice(0, parts.length - 1)
          .concat(fn(parts[parts.length - 1]))
        )
      }
    }

    const equals = m =>
      isSameType({ type }, m)
        && _equals(parts, m.toArray())

    function concat(method) {
      return function(t) {
        if (!isSameType({ type }, t)) {
          throw new TypeError(`${n}-Tuple.${method}: Tuple of the same length required`)
        }

        const a = t.toArray()

        return Tuple(n, parts.map((v, i, o) => {
          if (!(isSemigroup(a[i]) && isSemigroup(o[i]))) {
            throw new TypeError(
              `${n}-Tuple.${method}: Both Tuples must contain Semigroups of the same type`
            )
          }

          if (!isSameType(a[i], o[i])) {
            throw new TypeError(
              `${n}-Tuple.${method}: Both Tuples must contain Semigroups of the same type`
            )
          }

          return o[i].concat(a[i])
        }))
      }
    }

    function merge(fn) {
      if (!isFunction(fn)) {
        throw new TypeError(`${n}-Tuple.merge: Function required`)
      }

      return fn(...parts)
    }

    function mapAll(...args) {
      if (args.length !== parts.length) {
        throw new TypeError(
          `${n}-Tuple.mapAll: Requires ${parts.length} functions`
        )
      }

      return Tuple(
        n,
        parts.map((v, i) => {
          if (!isFunction(args[i])) {
            throw new TypeError(
              `${n}-Tuple.mapAll: Functions required for all arguments`
            )
          }
          return args[i](v)
        })
      )
    }

    function project(index) {
      if (!isInteger(index) || index < 1 || index > n) {
        throw new TypeError(
          `${n}-Tuple.project: Index should be an integer between 1 and ${n}`
        )
      }

      return parts[index - 1]
    }

    function toArray() {
      return parts.slice()
    }

    return {
      inspect, toString: inspect, merge,
      project, mapAll, toArray,
      type, equals,
      map: map('map'),
      concat: concat('concat'),
      [fl.map]: map(fl.map),
      [fl.concat]: concat(fl.concat),
      [fl.equals]: equals,
      ['@@type']: typeString,
      constructor: Tuple
    }
  }
}

_Tuple['@@type'] = typeString
_Tuple['@@implements'] = _implements([ 'map', 'concat', 'equals' ])

module.exports = _Tuple
