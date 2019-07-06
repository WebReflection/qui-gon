(function QuiGonJS() {'use strict';

  // (c) Andrea Giammarchi

  const {assign, create, defineProperty, freeze, keys, seal} = Object;

  const G = typeof self === 'object' ? self : global;

  const casts = create(null);
  const types = [];

  // basic primitives, casted via constructors
  // let {boolean: init} = 1;
  // const {number: nums} = [0, '1.2', 3];
  [
    {boolean: 'Boolean'},
    {number: 'Number'},
    {object: 'Object'},
    {string: 'String'},
  ]
  .forEach(definition => {
    const [type] = keys(definition);
    const Class = G[definition[type]];
    const cast = function () {
      return typeof this === type ? this : Class(this);
    };
    casts[type] = cast;
    defineProperty(Array.prototype, type, {get: map(cast)});
    defineProperty(Object.prototype, type, {get: fn(cast)});
    types.push(definition);
  });

  // primitives that cannot be casted (throws TypeError)
  // const {symbol: iterator} = Symbol.iterator;
  [
    {symbol: 'Symbol'},
  ]
  .forEach(definition => {
    const [type] = keys(definition);
    const name = definition[type];
    if (typeof G[name] === 'function') {
      const cast = function () {
        if (typeof this === type)
          return this;
        throw new TypeError(String(this) + ' is not a ' + name);
      };
      casts[type] = cast;
      defineProperty(Array.prototype, type, {get: map(cast)});
      defineProperty(Object.prototype, type, {get: fn(cast)});
      types.push(definition);
    }
  });

  // Rust like primitives (plus uc8) casted via value assignment
  // const {f32: coords} = [lat, long];
  [
    {f32: 'Float32Array'},
    {f64: 'Float64Array'},
    {i8: 'Int8Array'},
    {i16: 'Int16Array'},
    {i32: 'Int32Array'},
    {u16: 'Uint16Array'},
    {u32: 'Uint32Array'},
    // extra Qui-Gon Jinn Script type
    {uc8: 'Uint8ClampedArray'},
  ]
  .forEach(definition => {
    const [type] = keys(definition);
    const Class = G[definition[type]];
    if (typeof Class === 'function') {
      const reference = new Class(1);
      const cast = function () {
        reference[0] = this;
        return reference[0];
      };
      casts[type] = cast;
      defineProperty(Array.prototype, type, {
        get() { return new Class(this); }
      });
      defineProperty(Object.prototype, type, {get: fn(cast)});
      types.push(definition);
    }
  });

  // still Rust like values with different casting
  [
    {i64: 'BigInt64Array'},
    {u64: 'BigUint64Array'},
  ]
  .forEach(definition => {
    const [type] = keys(definition);
    const Class = definition[type];
    const constructor = G[Class.slice(0, Class.indexOf('64'))];
    if (typeof constructor === 'function' && typeof G[Class] === 'function') {
      const cast = function () {
        return constructor(this);
      };
      casts[type] = cast;
      defineProperty(Array.prototype, type, {get: map(cast)});
      defineProperty(Object.prototype, type, {get: fn(cast)});
      types.push(definition);
    }
  });

  // arrays (aka Rust mutable tuple)
  // const {array: numbers} = [1, 2, '3', 4];
  [
    {array: 'Array'}
  ]
  .forEach(definition => {
    const [type] = keys(definition);
    const Class = G[definition[type]];
    const cast = function () {
      return Class.from(this);
    };
    casts[type] = cast;
    defineProperty(Array.prototype, type, {get: cast});
    defineProperty(Object.prototype, type, {get: fn(cast)});
    types.push(definition);
  });

  // struct (simple Rust structs)
  // const {struct: Point} = [{i32: 'x'}, {i32: 'y'}];
  defineProperty(Array.prototype, 'struct', {get() {
    const descriptors = create(null);
    const {prototype} = Struct;
    keys(this).forEach(definition => {
      const [type] = keys(definition);
      const name = definition[type];
      const cast = casts[type];
      const _ = new WeakMap;
      descriptors[name] = {
        get() { return _.get(this); },
        set(value) { _.set(this, cast.call(value)); }
      };
    });
    freeze(prototype);
    return freeze(Struct);
    function Struct(self) {
      return seal(assign(create(prototype, descriptors), self));
    }
  }});

  defineProperty(G, 'types', {value: types.map(type => keys(type)[0])});

  function fn(cast) {
    return function () {
      return typeof this === 'function' ?
        wrapFn(cast, this) :
        cast.call(this);
    };
  }

  function map(cast) {
    return function () {
      return this.map(value => cast.call(value));
    };
  }

  function wrapFn(cast, fn) {
    return function () {
      return cast.call(fn.apply(this, arguments));
    };
  }

}());
