module.exports = {
  root: true,
  env: {
		// 启用 ES6 语法支持以及新的 ES6 全局变量或类型
		es6: true, 
		// Node.js 全局变量和 Node.js 作用域
		node: true, 
		// 浏览器全局变量
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
    // 支持es语法
    ecmaVersion: 6,
    // 使用babel-eslint解析器
    parser: "babel-eslint",
    // 模块加载资源类型
    sourceType: "module",
  }
};
