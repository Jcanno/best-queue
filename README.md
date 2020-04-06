# **Queue-Request**

[English](https://github.com/Jcanno/queue-request)|[简体中文](https://github.com/Jcanno/queue-request/blob/master/README-CH.md)

## Introduction

`queue-request` supports to control concurrence request.A queue is consisted of some batches of requests.Every batch of requests contains one `request` at least.When a batch of requests finished, the next batch of requests will run.

## Install
type in the command line to install with:

```js
npm i queue-request
```

## Usage
Import as an ES Module:
```js
import Queue from 'queue-request';
```

Import in Node:
```js
const Queue = require('queue-request');
```

Constructor:
```js
new Queue(option);
```

## **Example**
```js
import Queue from 'queue-request';
import axios from 'axios';

let queue = new Queue({
	max: 1,
	interval: 1 * 1000,
	// callback when every batch of requests done
	cb: (result, queue) => {
		console.log('a batch of requests done')
	}
})

// add request to queue 
queue.Add('https://www.npmjs.com')
		 .Add({
			 url: 'https://www.webpackjs.com/',
			 method: 'get'
		 })

// package request function by axios
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
// add array request
queue.Add([
	getVuejs,
	getReactjs
])
// start to handle requests
queue.Run()
// get result of requests
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

	- **description**:  the property to initialize `Queue`

	- **type**: `Object`

	- **default**: `{}`

	- **usage**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// callback when every batch of requests done
		cb: (result, queue) => {
			console.log('a batch of requests done')
		}
	})
	```

- options.max:

	- **description**:  the max number of every batch of requests, default to 1

	- **type**: `Number`

	- **default**: `1`

- options.interval:

	- **description**:  the interval time between every batches of requests(milliscond)

	- **type**: `Number`

	- **default**: `0`

- options.cb:

	- **description**:  the callback when every batch of requests finished

	- **type**: `Function`

	- **default**: `() => {}`

- Add(requests, priority):

	- **description**:  add request to queue

	- **type**: `requests`: any, `priority`: Number

	- **usage**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// callback when every batch of requests done
		cb: (result, queue) => {
			console.log('a batch of requests done')
		}
	})

	// add url request, default get method
	queue.Add('https://www.webpackjs.com/', 1)
	// add array url request
	queue.Add([
		'https://cn.vuejs.org',
		'https://reactjs.org',
	], 5)
	// chain add url request
	// https://www.npmjs.com will handle first due to its highest priority, priority default to 0
	queue.Add('https://www.npmjs.com', 6)
		 .Add('https://github.com')
	```

- Run() 

	- **description**:  `Run` will start the queue

	- **type**: `Function`

	- **usage**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// callback when every batch of requests done
		cb: (result, queue) => {
			console.log('a batch of requests done')
		}
	})

	// add url request, default get method
	queue.Add('https://www.webpackjs.com/')
	queue.Run()
	```

- Result()

	- **description**:  `Result` return Promise and the result of all requests.

	- **type**: `Function`

	- **usage**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// callback when every batch of requests done
		cb: (result, queue) => {
			console.log('a batch of requests done')
		}
	})

	// add url request
	queue.Add('https://www.webpackjs.com/')
	queue.Run()
	queue.Result().then(result => {
		console.log(result)
	})
	```

- Pause()

	- **description**:  `Pause` the queue, `Result` method will return the result of finished requests.

	- **type**: `Function`

	- **usage**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// callback when every batch of requests done
		cb: (result, queue) => {
			console.log('a batch of requests done')
			// queue will be paused after request https://www.webpackjs.com
			if(result[0].config.url === 'https://www.webpackjs.com') {
				queue.Pause()
			}
		}
	})

	// add url request
	queue.Add('https://www.webpackjs.com')
	// add array url request
	queue.Add([
		'https://cn.vuejs.org',
		'https://reactjs.org',
	])
	queue.Run()
	queue.Result().then(result => {
		// the queue paused
		// return the result of first batch of requests in this case
		console.log(result)
	})
	```

- Continue()

	- **description**: rerun the queue, you need to call the `Result` method again to get the result of all requests.

	- **type**: `Function`

	- **usage**:

	```js
	let queue = new Queue({
		max: 1,
		interval: 1 * 1000,
		// callback when every batch of requests done
		cb: (result, queue) => {
			console.log('a batch of requests done')
			// a batch of requests done the queue will be paused
			if(result[0].config.url === 'https://www.webpackjs.com') {
				queue.Pause()
			}
		}
	})
	// add url request
	queue.Add('https://www.webpackjs.com/')
	// add array url request
	queue.Add([
		'https://cn.vuejs.org',
		'https://reactjs.org',
	])

	queue.Run()
	queue.Result().then(() => {
		// queue will rerun
		queue.Continue()
		queue.Result().then(result => {
			console.log(result)
		})
	})
	```

- Stop()

	- **description**: stop and reinit the queue, all result of finished requests will be cleared too.

	- **type**: `Function`

## Lisence

Copyright (c) 2020 Jacano Licensed under the MIT license.
