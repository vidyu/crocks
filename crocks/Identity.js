/** @license ISC License (c) copyright 2016 original and current authors */
/** @author Ian Hofmann-Hicks (evil) */

const isFunction = require('../internal/isFunction')
const isType = require('../internal/isType')
const isApplicative = require('../internal/isApplicative')

const _inspect = require('../funcs/inspect')

const constant = require('../combinators/constant')
const composeB = require('../combinators/composeB')
const identity = require('../combinators/identity')

const _type =
  constant('Identity')

const _of =
  Identity

function Identity(x) {
  if(!arguments.length) {
    throw new TypeError('Identity: Must wrap something')
  }

  const value =
    constant(x)

  const type =
    _type

  const of =
    _of

  const equals =
    m => isType(type(), m) && x === m.value()

  const inspect =
    constant(`Identity${_inspect(x)}`)

  function map(fn) {
    if(!isFunction(fn)) {
      throw new TypeError('Identity.map: Function required')
    }

    return Identity(fn(x))
  }

  function ap(m) {
    if(!isFunction(x)) {
      throw new TypeError('Identity.ap: Wrapped value must be a function')
    }
    else if(!isType(type(), m)) {
      throw new TypeError('Identity.ap: Identity required')
    }

    return m.map(x)
  }

  function chain(fn) {
    if(!isFunction(fn)) {
      throw new TypeError('Identity.chain: Function required')
    }

    const m = fn(x)

    if(!(m && isType(type(), m))) {
      throw new TypeError('Identity.chain: function must return an Identity')
    }

    return m
  }

  function sequence(af) {
    if(!isFunction(af)) {
      throw new TypeError('Identity.sequence: Applicative Function required')
    }
    else if(!isApplicative(x)) {
      throw new TypeError('Identity.sequence: Must wrap an Applicative')
    }

    return x.map(Identity)
  }

  function traverse(f, af) {
    if(!isFunction(f)) {
      throw new TypeError('Identity.traverse: Applicative returning function required for first argument')
    }
    else if(!isFunction(af)) {
      throw new TypeError('Identity.traverse: Applicative function required for second argument')
    }

    const m = f(x)

    if(!isApplicative(m)) {
      throw new TypeError('Identity.traverse: First function must return an Applicative')
    }

    return m.map(Identity)
  }

  return {
    inspect, value, type, equals,
    map, ap, of, chain, sequence,
    traverse
  }
}

Identity.of =
  _of

Identity.type =
  _type

module.exports = Identity
