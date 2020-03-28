module.exports = {
  root: true,
  env: {
		es6: true, 
		node: true, 
		browser: true
	},
  extends: [
    "eslint:recommended",
    "scales"
	],
	rules: {
		"no-empty-function": 0
	},
  parserOptions: {
    ecmaVersion: 6,
    parser: "babel-eslint",
    sourceType: "module",
  }
};
