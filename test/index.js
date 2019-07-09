require('../'); // qui-gon

const {boolean: t} = true;
const {boolean: f} = false;

console.assert(t === true, 'true');
console.assert(f === false, 'false');

const {number: n} = '1.2';
console.assert(n === 1.2, 'n === 1.2');

const {number: ns} = ['1.2', 3.4];
console.assert(ns[0] === 1.2 && ns[1] === 3.4, 'ns');

const {symbol: s} = Symbol('OK');
console.assert(typeof s === 'symbol', 'symbol s');

try {
  const {symbol: nope} = 'OK';
  console.assert(false, 'this should not happen');
} catch(o_O) {}

const {i8: si} = 1.2;
console.assert(si === 1, 'si');

const {i8: sa} = [1.2, 3.4];
console.assert(sa[0] === 1 && sa[1] === 3, 'sa');

const {array: genericArray} = [1, '2', 3];
console.assert(genericArray.length === 3);

try {
  const {struct: Fail} = [{u8: 'nope'}];
  console.assert(!Fail, 'this should not happen');
} catch (OK) {}

const {struct: Point} = [{i32: 'x'}, {i32: 'y'}];
const p = Point({x: 1.2, y: 3.4});

console.assert(p instanceof Point, 'Point');
console.assert(p.x === 1 && p.y === 3, 'p');

p.x = 4.1;
console.assert(p.x === 4, 'p.x');

const {struct: Point3D} = {Point3D: [{f32: 'x'}, {f32: 'y'}, {f32: 'z'}]};
const p3d = Point3D({x: 0, y: 0, z: 0});
console.assert(p3d.x === 0 && p3d.y === 0 && p3d.z === 0, 'p3d');

const {Point3D: another} = Point3D({x: .1, y: .2, z: .3});
console.assert(
  another.x.toFixed(1) == .1 &&
  another.y.toFixed(1) == .2 &&
  another.z.toFixed(1) == .3,
  'another'
);

const {struct: Struct} = {Point3D: [{f32: 'x'}, {f32: 'y'}, {f32: 'z'}]};
console.assert(typeof Struct === 'function' && Struct !== Point3D, 'Struct != Point3D');

const {i32: foo} = ({i32: x}) => x * 2;
console.assert(foo(2) === 4, 'foo(...)');

const {i32: bar} = ({i32: x}, {i32: y}) => x * y;
console.assert(bar(3, 4) === 12, 'bar(...)');

console.assert(types, 'types');

const {enum: Color} = {Color: [
  'Red', 'Green', 'Blue',
  {RGB: [{u32: 'r'}, {u32: 'g'}, {u32: 'b'}, {u16: 'length'}]}
]};

console.assert(typeof Color.Red === 'symbol');
console.assert(typeof Color.Green === 'symbol');
console.assert(typeof Color.Blue === 'symbol');
console.assert(Color.RGB({r: 1, g: 2, b: 3, length: 3}) === Color.RGB, 'returns as enum');
console.assert(Color.RGB.r === 1);
console.assert(Color.RGB.g === 2);
console.assert(Color.RGB.b === 3);
console.assert(Color.RGB.length === 3);
