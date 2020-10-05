import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser'

export default {
	input: 'src/index.ts',
	output: {
		file: 'dist/index.js',
		format: 'umd',
		name: 'BestQueue'
	},
	plugins: [
		typescript({
      tsconfig: 'tsconfig.json',
      useTsconfigDeclarationDir: true
    }),
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    }),
	]
};
