/** @license ISC License (c) copyright 2016 original and current authors */
/** @author Ian Hofmann-Hicks (evil) */

const VERSION = 2

const _implements = require('../core/implements')
const _inspect = require('../core/inspect')
const _type = require('../core/types').type('Star')
const __type = require('../core/types').typeFn(_type(), VERSION)
const fl = require('../core/flNames')

const array = require('../core/array')
const isFunction = require('../core/isFunction')
const isMonad = require('../core/isMonad')
const isSameType = require('../core/isSameType')

const Pair = require('../core/Pair')

const merge =
  (fn, m) => m.merge(fn)

const sequence =
  (af, m) => array.sequence(af, m)

function _Star(Monad) {
  if(!isMonad(Monad)) {
    throw new TypeError('Star: Monad required for construction')
  }

  const _id =
    () => Star(Monad.of)

  const innerType =
    Monad.type()

  const innerFullType =
    Monad['@@type']

  const outerType =
    `${_type()}( ${innerType} )`

  const typeString =
    `${__type}( ${innerFullType} )`

  const type =
    () => outerType

  function Star(runWith) {
    if(!isFunction(runWith)) {
      throw new TypeError(`${outerType}: Function in the form (a -> m b) required`)
    }

    const inspect =
      () => `${outerType}${_inspect(runWith)}`

    const id =
      _id

    function compose(method) {
      return function(s) {
        if(!isSameType(Star, s)) {
          throw new TypeError(`${outerType}.${method}: ${outerType} required`)
        }

        return Star(function(x) {
          const m = runWith(x)

          if(!isSameType(Monad, m)) {
            throw new TypeError(`${outerType}.${method}: Computations must return a type of ${innerType}`)
          }

          return m.chain(function(val) {
            const inner = s.runWith(val)

            if(!isSameType(m, inner)) {
              throw new TypeError(`${outerType}.${method}: Both computations must return a type of ${innerType}`)
            }

            return inner
          })
        })
      }
    }

    function map(method) {
      return function(fn) {
        if(!isFunction(fn)) {
          throw new TypeError(`${outerType}.${method}: Function required`)
        }

        return Star(function(x) {
          const m = runWith(x)

          if(!isSameType(Monad, m)) {
            throw new TypeError(`${outerType}.${method}: Computations must return a type of ${innerType}`)
          }

          return m.map(fn)
        })
      }
    }

    function contramap(method) {
      return function(fn) {
        if(!isFunction(fn)) {
          throw new TypeError(`${outerType}.${method}: Function required`)
        }

        return Star(x => runWith(fn(x)))
      }
    }

    function promap(method) {
      return function(l, r) {
        if(!isFunction(l) || !isFunction(r)) {
          throw new TypeError(`${outerType}.${method}: Functions required for both arguments`)
        }

        return Star(function(x) {
          const m = runWith(l(x))

          if(!isSameType(Monad, m)) {
            throw new TypeError(`${outerType}.${method}: Computation must return a type of ${innerType}`)
          }

          return m.map(r)
        })
      }
    }

    function first() {
      return Star(function(x) {
        if(!isSameType(Pair, x)) {
          throw TypeError(`${outerType}.first: Pair required for computation input`)
        }

        const m = runWith(x.fst())

        if(!isSameType(Monad, m)) {
          throw new TypeError(`${outerType}.first: Computation must return a type of ${innerType}`)
        }

        return m.map(l => Pair(l, x.snd()))
      })
    }

    function second() {
      return Star(function(x) {
        if(!isSameType(Pair, x)) {
          throw TypeError(`${outerType}.second: Pair required for computation input`)
        }

        const m = runWith(x.snd())

        if(!isSameType(Monad, m)) {
          throw new TypeError(`${outerType}.second: Computation must return a type of ${innerType}`)
        }

        return m.map(r => Pair(x.fst(), r))
      })
    }

    function both() {
      return Star(function(x) {
        if(!isSameType(Pair, x)) {
          throw TypeError(`${outerType}.both: Pair required for computation input`)
        }

        const p = x.bimap(runWith, runWith)
        const m = p.fst()

        if(!isSameType(Monad, m)) {
          throw new TypeError(`${outerType}.both: Computation must return a type of ${innerType}`)
        }

        return sequence(m.of, merge((x, y) => [ x, y ], p)).map(x => Pair(x[0], x[1]))
      })
    }

    return {
      inspect, toString: inspect, type,
      runWith, id, first, second, both,
      compose: compose('compose'),
      contramap: contramap('contramap'),
      map: map('map'),
      promap: promap('promap'),
      [fl.id]: id,
      [fl.compose]: compose(fl.compose),
      [fl.contramap]: contramap(fl.contramap),
      [fl.map]: map(fl.map),
      [fl.promap]: promap(fl.promap),
      ['@@type']: typeString,
      constructor: Star
    }
  }

  Star.id = _id
  Star.type = type

  Star[fl.id] = _id
  Star['@@type'] = typeString

  Star['@@implements'] = _implements(
    [ 'compose', 'contramap', 'id', 'map', 'promap' ]
  )

  return Star
}

module.exports = _Star
