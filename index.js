(function QuiGonJS() {'use strict';

  /*! (c) Andrea Giammarchi - ISC */

  const {
    assign,
    create,
    defineProperty,
    freeze,
    getOwnPropertyNames,
    keys,
    seal,
    setPrototypeOf
  } = Object;

  /* istanbul ignore next */
  const G = typeof(self) === 'object' ? self : global;

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
    const cast = self => typeof(self) === type ? self : Class(self);
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
    /* istanbul ignore else */
    if (typeof(G[name]) === 'function') {
      const cast = self => {
        if (typeof(self) === type)
          return self;
        throw new TypeError(String(self) + ' is not a ' + name);
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
    {u8: 'Uint8Array'},
    {u16: 'Uint16Array'},
    {u32: 'Uint32Array'},
    // extra Qui-Gon Jinn Script type
    {uc8: 'Uint8ClampedArray'},
  ]
  .forEach(definition => {
    const [type] = keys(definition);
    const Class = G[definition[type]];
    /* istanbul ignore else */
    if (typeof(Class) === 'function') {
      const reference = new Class(1);
      const cast = self => ((reference[0] = self), reference[0]);
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
    const cast = G[Class.slice(0, Class.indexOf('64'))];
    if (typeof(cast) === 'function' && typeof(G[Class]) === 'function') {
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
    const cast =  self => Class.from(self);
    casts[type] = cast;
    defineProperty(Array.prototype, type, {get() { return cast(this); }});
    defineProperty(Object.prototype, type, {get: fn(cast)});
    types.push(definition);
  });

  // struct (simple Rust structs)
  // const {struct: Point} = [{i32: 'x'}, {i32: 'y'}];
  defineProperty(Array.prototype, 'struct', {get() {
    const descriptors = create(null);
    const {prototype} = Struct;
    this.forEach(definition => {
      const [type] = keys(definition);
      const name = definition[type];
      const cast = getCast(type);
      const _ = new WeakMap;
      descriptors[name] = {
        enumerable: true,
        get() { return _.get(this); },
        set(value) { _.set(this, cast(value)); }
      };
    });
    freeze(prototype);
    return freeze(Struct);
    function Struct(self) {
      return seal(assign(create(prototype, descriptors), self));
    }
  }});

  // registered struct (simple Rust structs)
  // const {struct: Point} = {Point: [{f32: 'x'}, {f32: 'y'}]};
  // const {Point: p} = Point(0, 0);
  defineProperty(Object.prototype, 'struct', {get() {
    const [type] = keys(this);
    register(type);
    return this[type].struct;
  }});

  //  const {enum: WebEvent} = [
  //    'Loading',
  //    'Loaded',
  //    {Click: [{i64: 'x'}, {i64: 'y'}] }}
  //  ];
  defineProperty(Array.prototype, 'enum', {get() {
    const Enum = create(null);
    this.forEach(definition => {
      if (typeof definition === 'string') {
        Enum[definition] = Symbol(definition);
      } else {
        const [name] = keys(definition);
        const assignments = [];
        definition[name].forEach(definition => {
          const [type] = keys(definition);
          const name = definition[type];
          const cast = getCast(type);
          assignments.push({name, cast});
        });
        const fn = (self) => {
          assignments.forEach(definition => {
            const {name, cast} = definition;
            fn[name] = cast(self[name]);
          });
          return fn;
        };
        setPrototypeOf(fn, null);
        getOwnPropertyNames(fn).forEach(name => {
          delete fn[name];
        });
        Enum[name] = fn;
      }
    });
    return freeze(Enum);
  }});

  // registered enum (simple Rust enums)
  // const {enum: Color} = {Color: ['Red', 'Green', 'Blue']};
  // console.log(Color.Red);
  defineProperty(Object.prototype, 'enum', {get() {
    const [type] = keys(this);
    register(type);
    return this[type].enum;
  }});

  defineProperty(G, 'types', {value: types.map(type => keys(type)[0])});

  function fn(cast) {
    return function () {
      return typeof(this) === 'function' ?
        wrapFn(cast, this) :
        cast(this);
    };
  }

  function getCast(type) {
    if (!(type in casts))
      throw new TypeError('unknown type ' + type);
    return casts[type];
  }

  function map(cast) {
    return function () {
      return this.map(cast);
    };
  }

  function register(type) {
    if (!types.includes(type)) {
      types.push(type);
      defineProperty(Object.prototype, type, {get() { return this; }});
    }
  }

  function wrapFn(cast, fn) {
    return function () {
      return cast(fn.apply(this, arguments));
    };
  }

}());
