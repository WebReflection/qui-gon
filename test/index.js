require('../'); // qui-gon

const {boolean: t} = true;
const {boolean: f} = false;

console.assert(t === true);
console.assert(f === false);

const {number: n} = '1.2';
console.assert(n === 1.2);

const {number: ns} = ['1.2', 3.4];
console.assert(ns[0] === 1.2 && ns[1] === 3.4);

const {symbol: s} = Symbol('OK');
console.assert(typeof s === 'symbol');

try {
  const {symbol: nope} = 'OK';
  console.assert(false, 'this should not happen');
} catch(o_O) {}

const {i8: si} = 1.2;
console.assert(si === 1);

const {i8: sa} = [1.2, 3.4];
console.assert(sa[0] === 1 && sa[1] === 3);

const {array: genericArray} = [1, '2', 3];
console.assert(genericArray.length === 3);

const {struct: Point} = [{i32: 'x'}, {i32: 'y'}];
const p = Point({x: 1.2, y: 3.4});

console.assert(p instanceof Point);
console.assert(p.x === 1 && p.y === 3);

p.x = 4.1;
console.assert(p.x === 4);

const {struct: Point3D} = {Point3D: [{f32: 'x'}, {f32: 'y'}, {f32: 'z'}]};
const p3d = Point3D({x: 0, y: 0, z: 0});
console.assert(p3d.x === 0 && p3d.y === 0 && p3d.z === 0);

const {Point3D: another} = Point3D({x: .1, y: .2, z: .3});
console.assert(another.x === .1 && another.y === .2 && another.z === .3);

const {struct: Struct} = {Point3D: [{f32: 'x'}, {f32: 'y'}, {f32: 'z'}]};
console.assert(typeof Struct === 'function' && Struct !== Point3D);



const {i32: foo} = ({i32: x}) => x * 2;
console.assert(foo(2) === 4);

const {i32: bar} = ({i32: x}, {i32: y}) => x * y;
console.assert(bar(3, 4) === 12);

console.assert(types);
