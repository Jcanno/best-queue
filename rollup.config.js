import typescript from 'rollup-plugin-typescript2';

export default {
	input: 'index.ts',
	external: ['axios'],
	output: {
		file: 'index.js',
		format: 'umd',
		name: 'Queue',
		globals: {
			'axios': 'axios'
		}
	},
	plugins: [
		typescript({
			tsconfig: 'tsconfig.json'
		})
	]
};
