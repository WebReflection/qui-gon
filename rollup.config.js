import { terser } from 'rollup-plugin-terser';
export default {
  input: 'index.js',
  plugins: [terser()],
  context: 'null',
  moduleContext: 'null',
  output: {
    exports: 'named',
    file: 'min.js',
    format: 'iife',
    name: 'QuiGonJS'
  }
};
