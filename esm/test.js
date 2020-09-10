import {as, define, enums, fn, is, struct, union, unsafe} from './index.js';

define('Color', enums(
  {RED: 0},
  {GREEN: 1},
  {BUE: 2}
));

define('i32_f32', union);

define('Point3D', struct(
  {int: ['x', 'y']},
  {int: {z: 0}},
  {[float]: {coords() {
    return [this.x, this.y, this.z];
  }}}
));

console.time('safe');
test();
console.timeEnd('safe');

console.log('');

unsafe();
console.time('unsafe');
test();
console.timeEnd('unsafe');

function test() {
  const {Color: green} = 1;
  console.log('green', green);

  const {i32_f32: f_i} = 1;
  const {i32_f32: i_f} = 1.100000023841858;
  const {[i32_f32]: ii_ff} = [f_i, i_f];
  console.log(f_i, i_f, ii_ff);

  const {Point3D: p3d} = {x: 1, y: 2};
  p3d.z = 3;
  console.log(JSON.stringify(p3d), p3d.coords());
  const {[Point3D]: p3ds} = [{x: 1, y: 2}, {x: 1, y: 2}];
  console.log(p3ds[0].coords(), p3ds[1].coords());

  const {int: i} = 1;
  const {float: f} = 1.23;
  const {[int]: ii} = [1, 2, 3];

  console.log(i, ii, f);

  console.log(
    i, as({i32: f}), f,
    is({i32: i}),                 // true
    is({i32: f}),                 // false
    is({float: f}),               // true
    is({f32: as({f32: f})}),      // true
    is({[f32]: as({f32: f})}),    // false
    is({[f32]: as({[f32]: [f]})}) // true
  );

  const {number: num} = 1.23;
  console.log(num);

  const {i32: i32entry} = 1;
  const {[i32]: i32array} = new Int32Array([1, 2, 3]);
  console.log(i32entry, i32array, JSON.stringify(i32array));

  const {[f32]: f32array} = [1.1, 1.2];
  console.log(f32array);

  const {float: n} = -0;
  console.log(Object.is(n, -0));

  const foo = fn({int: ({int: x}) => x * 2});
  console.log(foo(2));

}
