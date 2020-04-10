module.exports = {
  root: true,
  env: {
		es6: true, 
		node: true, 
		browser: true
	},
  extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
    "scales"
	],
	rules: {
		"no-empty-function": 0,
		"@typescript-eslint/no-explicit-any": 0,
		"@typescript-eslint/no-empty-function": 0
	},
  parserOptions: {
    ecmaVersion: 6,
    parser: "babel-eslint",
    sourceType: "module",
	},
	parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
};
