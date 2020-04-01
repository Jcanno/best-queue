# **Queue-Request**

[English](https://github.com/Jcanno/queue-request)|[简体中文](https://github.com/Jcanno/queue-request/blob/master/README-CH.md)

## 介绍
`queue-request`能处理并发请求。队列由多批请求组成，每批请求中至少包含一个请求，当一批请求完成，下一批请求将会继续执行。

## 安装
在命令函输入以下代码进行安装:

```js
npm i queue-request
```

## 用法
通过`ES6 模块`导入:
```js
import Queue from 'queue-request';
```

`Node`环境下导入:
```js
const Queue = require('queue-request');
```

构造器:
```js
new Queue(option);
```

## **例子**
```js
import Queue from 'queue-request';
import axios from 'axios';

let queue = new Queue({
	max: 1,
	interval: 1 * 1000,
	// 每批请求完成时的回调
	cb: (result, queue) => {
		console.log('a batch of requests done')
	}
})

// 添加请求到队列中
queue.Add('https://www.npmjs.com')
		 .Add({
			 url: 'https://www.webpackjs.com/',
			 method: 'get'
		 })

// 通过axios封装请求函数
function getVuejs() {
	return axios({
		url: 'https://cn.vuejs.org'
	})
}

function getReactjs() {
	return axios({
		url: 'https://reactjs.org'
	})
}
// 添加数组请求
queue.Add([
	getVuejs,
	getReactjs
])
// 开始处理请求
queue.Run()
// 获取请求结果
queue.Result()
		 .then(result => {
				console.log(result)
			})
		 .catch(err => {
			  console.log(err)
		 })
```

## **API**

- options:

	- **描述**:  用于初始化 `Queue` 的属性

	- **类型**: `Object`

	- **默认值**: `{}`

	- **用法**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// 每批请求完成时的回调
		cb: (result, queue) => {
			console.log('a batch of requests done')
		}
	})
	let queue = new Queue(options)
	```

- options.max:

	- **描述**:  每批请求中的最大请求量，默认为1

	- **类型**: `Number`

	- **默认值**: `1`

- options.interval:

	- **描述**:  每批请求之间的间隔(毫秒)

	- **类型**: `Number`

	- **默认值**: `0`

- options.cb:

	- **描述**:  每批请求完成时的回调

	- **类型**: `Function`

	- **默认值**: `() => {}`

- Add(requests, priority):

	- **描述**:  添加请求到队列中

	- **类型**: `requests`: any, `priority`: Number

	- **用法**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// 每批请求完成时的回调
		cb: (result, queue) => {
			console.log('a batch of requests done')
		}
	})
	let queue = new Queue(options)

	// 添加url请求, 默认get
	queue.Add('https://www.webpackjs.com/', 1)
	// 添加数组url请求
	queue.Add([
		'https://cn.vuejs.org',
		'https://reactjs.org',
	], 5)
	// 链式添加url请求
	// https://www.npmjs.com 将会最先被执行，它具有最高优先级, priority默认为0
	queue.Add('https://www.npmjs.com', 6)
		 .Add('https://github.com')
	```

- Run() 

	- **描述**:  `Run` 将会执行整个队列任务

	- **类型**: `Function`

	- **用法**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// 每批请求完成时的回调
		cb: (result, queue) => {
			console.log('a batch of requests done')
		}
	})
	let queue = new Queue(options)

	// 添加url请求, 默认get
	queue.Add('https://www.webpackjs.com/')
	queue.Run()
	```

- Result()

	- **描述**:  `Result` 返回一个`Promise` 并可以获取所有请求的结果

	- **类型**: `Function`

	- **用法**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// 每批请求完成时的回调
		cb: (result, queue) => {
			console.log('a batch of requests done')
		}
	})
	let queue = new Queue(options)

	// 添加url请求, 默认get
	queue.Add('https://www.webpackjs.com/')
	queue.Run()
	queue.Result().then(result => {
		console.log(result)
	})
	```

- Pause()

	- **描述**:  暂停队列, 此时的`Result`方法会返回当前已完成请求的结果

	- **类型**: `Function`

	- **用法**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// 每批请求完成时的回调
		cb: (result, queue) => {
			console.log('a batch of requests done')
			// 队列在请求https://www.webpackjs.com后暂停
			if(result[0].config.url === 'https://www.webpackjs.com') {
				queue.Pause()
			}
		}
	})
	let queue = new Queue(options)

	// 添加url请求, 默认get
	queue.Add('https://www.webpackjs.com')
	// 添加数组url请求
	queue.Add([
		'https://cn.vuejs.org',
		'https://reactjs.org',
	])
	queue.Run()
	queue.Result().then(result => {
		// 请求队列暂停
		// 在这个案例中，会返回第一批请求的结果
		console.log(result)
	})
	```

- Continue()

	- **描述**: 继续执行队列，此时需要再次调用`Result`方法来获取所有请求的结果

	- **类型**: `Function`

	- **用法**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// 每批请求完成时的回调
		cb: (result, queue) => {
			console.log('a batch of requests done')
			// 队列在请求https://www.webpackjs.com后暂停
			if(result[0].config.url === 'https://www.webpackjs.com') {
				queue.Pause()
			}
		}
	})
	let queue = new Queue(options)

	// 添加url请求, 默认get
	queue.Add('https://www.webpackjs.com')
	// 添加数组url请求
	queue.Add([
		'https://cn.vuejs.org',
		'https://reactjs.org',
	])

	queue.Run()
	queue.Result().then(res => {
		// 队列将会继续运行
		queue.Continue()
		queue.Result().then(result => {
			console.log(result)
		})
	})
	```

- Stop()

	- **描述**: 停止并且重新初始化整个队列，所有请求的返回值会被清空

	- **类型**: `Function`

## Lisence

Copyright (c) 2020 Jacano Licensed under the MIT license.

