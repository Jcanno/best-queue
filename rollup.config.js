import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'index.ts',
  output: {
    file: 'index.js',
		format: 'umd',
		name: 'Queue'
	},
	plugins: [
		typescript({
			tsconfig: "tsconfig.json"
		})
	]
};