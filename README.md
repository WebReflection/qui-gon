# Qui-Gon Jinn Script

[![Build Status](https://travis-ci.com/WebReflection/qui-gon.svg?branch=master)](https://travis-ci.com/WebReflection/qui-gon) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/qui-gon/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/qui-gon?branch=master)

<sup>**Social Media Photo by [Thomas Griesbeck](https://unsplash.com/@jack_scorner) on [Unsplash](https://unsplash.com/)**</sup>

Destructured types for any JS env.

```js
// QuiGonJS in a nutshell
const {type: name} = value;
```


### Status: Experiment

This is a proof of concept based on destructuring syntax and the highly dynamic nature of JS.

The short term goal is to evaluate the community reaction, while the long term one is to create tooling able to target WASM from a JS' subset.


### Types

#### Array/var types

  * Rust types: _f32_, _f64_, _i8_, _i16_, _i32_, _i64_, _u16_, _u32_, _u64_
  * JS types: _u8_, _uc8_ <sup><sub>(Uint8ClampedArray)</sub></sup>

#### Generics

  * Rust types: _enum_, _struct_
  * JS types: _array_, _boolean_, _number_, _string_, _symbol_


#### Current Limitations

  * object literals can only represent well known structs, and structs cannot have methods.
  * closures are not working (yet), use functions instead
  * functions can only be arrows, meaning no `this` context and no `arguments`


### Playground

Live [CodePen](https://codepen.io/WebReflection/pen/wLRqMw?editors=0010) where you can test any of the following examples.


## Examples

```js
import 'qui-gon';

// mutable init (as true)
let {boolean: init} = 1;

// array of numbers (as [0, 1.2, 2])
const {number: nums} = [0, '1.2', 2];

// non-castable types (throws if not a Symbol)
const {symbol: iterator} = Symbol.iterator;

// as single value 3 / 1n
const {i32: i} = 3.2;
const {i64: bi} = 1;

// as fixed array of values Float32Array
const {f32: floats} = [1, 2, 3, 4];

// Rust mutable tuple equivalent
const {array: numbers} = [1, 2, '3', 4];

// Rust basic struct
// const {struct: Name} = [{type: "fieldName"}, ...{type: "fieldName"}];
const {struct: Point} = [{i32: 'x'}, {i32: 'y'}];
const p = Point({x: 0, y: 0});

// registered struct by name
const {struct: Point2D} = {Point2D: [{i32: 'x'}, {i32: 'y'}]};
const p2d = Point2D({x: 1, y: 2});
const {Point2D: p3} = Point({x: 1, y: 2});

// Functions
// const {returnType: name} = ({type1: name1}, ...{typeN: nameN}) => { ... };
const {i32: foo} = ({i32: x}) => x * 2;
foo(2); // 4

const {i32: bar} = ({i32: x}, {i32: y}) => x * y;
bar(3, 4); // 12

// Rust like (registered) enums
const {enum: WebEvent} = {WebEvent: [
  'Loading',
  'Loaded',
  {Click: [{i32: 'x'}, {i32: 'y'}] }}
]};

const click = WebEvent.Click({x: 10, y: 23});
click === WebEvent.Click; // true
const {x, y} = WebEvent.Click; // x: 10, y: 23
```
