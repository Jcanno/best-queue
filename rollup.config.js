import path from 'path'
import babelPlugin from '@rollup/plugin-babel'
import esbuild from 'rollup-plugin-esbuild'
import resolve from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'
import commonjs from '@rollup/plugin-commonjs'

const extensions = ['.js', '.ts']
const { root } = path.parse(process.cwd())
const terserPlugin = [
  terser({
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
    },
    format: {
      comments: RegExp(`${pkg.name}`),
    },
  }),
]

function external(id) {
  return !id.startsWith('.') && !id.startsWith(root)
}

function createCommonJSConfig(input, output) {
  return defineConfig({
    input,
    output: { file: output, format: 'cjs', exports: 'named' },
    external,
    plugins: [
      resolve({ extensions }),
      babelPlugin({ babelHelpers: 'runtime', extensions, comments: false }),
      ...terserPlugin,
    ],
  })
}

function createESMConfig(input, output) {
  return defineConfig({
    input,
    output: { file: output, format: 'esm' },
    external,
    plugins: [
      resolve({ extensions }),
      esbuild({
        minify: false,
        target: 'node12',
        tsconfig: path.resolve('./tsconfig.json'),
      }),
      ...terserPlugin,
    ],
  })
}

function createUMDJSConfig(input, output) {
  return defineConfig({
    input,
    output: { file: output, format: 'umd', name: 'BQueue' },
    plugins: [
      resolve({ extensions }),
      babelPlugin({
        extensions,
        babelHelpers: 'runtime',
        comments: false,
        plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-transform-typescript'],
      }),
      commonjs({
        extensions,
      }),
      ...terserPlugin,
    ],
  })
}

export default function () {
  return [
    createCommonJSConfig('src/index.ts', 'lib/index.js'),
    createESMConfig('src/index.ts', 'es/index.js'),
    createUMDJSConfig('src/index.ts', 'dist/best-queue.js'),
  ]
}
