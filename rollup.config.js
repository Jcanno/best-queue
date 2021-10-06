import path from 'path'
import babelPlugin from '@rollup/plugin-babel'
import esbuild from 'rollup-plugin-esbuild'
import resolve from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'

const extensions = ['.js', '.ts']
const { root } = path.parse(process.cwd())

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
      babelPlugin({ babelHelpers: 'bundled', extensions, comments: false }),
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
    ],
  })
}

export default function () {
  return [
    createCommonJSConfig('src/index.ts', 'lib/index.js'),
    createESMConfig('src/index.ts', 'es/index.js'),
  ]
}
