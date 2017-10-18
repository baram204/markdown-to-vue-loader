const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const pkg = require('./package');

const now = new Date();

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
    },
  ],
  external: [
    'cheerio',
    'loader-utils',
    'markdown-it',
    'postcss',
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
  banner: `/*!
 * Markdown To Vue Loader v${pkg.version}
 * https://github.com/${pkg.repository}
 *
 * Copyright (c) ${now.getFullYear()} Xkeshi
 * Released under the ${pkg.license} license
 *
 * Date: ${now.toISOString()}
 */
`,
};
