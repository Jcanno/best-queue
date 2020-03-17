# **Queue-Request**

[English](https://github.com/Jcanno/queue-request)|(简体中文)[https://github.com/Jcanno/queue-request/blob/master/README-CH.md]

## **Api**

```js
// genenral func
function generatorPromiseFunc(v) {
	return function() {
		return Promise.resolve(v);
	};
}

function generatorDelayPromiseFunc(v) {
	return function() {
		return new Promise(r => {
			setTimeout(() => {
				r(v);
			}, 1000);
		});
	};
}
```
- options:

	- **description**:  the property to initialize `Queue`

	- **type**: `Object`

	- **default**: `{max: 1, interval: 0, cb: () => {}}`

	- **usage**:

	```js
	let options = {
		max: 5,
		interval: 1 * 1000,
		cb: (val, queue) => {
			if(val[0] === 1) {
				queue.Pause()
			}
		}
	}
	let queue = new Queue(options)
	```

- options.max:

	- **description**:  the max concurrence number in one task, the task will be excuted one by one when max is 1

	- **type**: `Number`

	- **default**: `1`

- options.interval:

	- **description**:  the interval time between two tasks(milliscond)

	- **type**: `Number`

	- **default**: `0`

- options.cb:

	- **description**:  the callback when a task finished, it receives one Array what is the result of this task and an instance `Queue`. You can `Pause`、`Add` the queue, of cource, you can do something else like check the result

	- **type**: `Function`

	- **default**: `() => {}`

- Add(task):

	- **description**:  `Add` receives Function or Array of Function, the Function should return a `Promise`.

	- **type**: `Function<Function|Array<Function>>`

	- **usage**:

	```js
	let options = {
		max: 5,
		interval: 1 * 1000,
		cb: (val, queue) => {
			if(val[0] === 1) {
				queue.Pause()
			}
		}
	}
	let queue = new Queue(options)

	// you can transmit Function
	queue.Add(generatorPromiseFunc(1))
	// you can transmit Array of Function
	queue.Add([
		generatorPromiseFunc(2),
		generatorPromiseFunc(3),
	])
	// you can also chain call method Add
	queue.Add(generatorPromiseFunc(4))
		 .Add(generatorPromiseFunc(5))
	```

- Run() 

	- **description**:  `Run` will start the queue.

	- **type**: `Function`

	- **usage**:

	```js
	let options = {
		max: 5,
		interval: 1 * 1000,
		cb: (val, queue) => {
			if(val[0] === 1) {
				queue.Pause()
			}
		}
	}
	let queue = new Queue(options)

	queue.Add(generatorPromiseFunc(1))
	queue.Run()
	```

- Result()

	- **description**:  `Result` return Promise which carry the result of all tasks when the queue finish over.

	- **type**: `Function`

	- **usage**:

	```js
	let options = {
		max: 5,
		interval: 1 * 1000,
		cb: (val, queue) => {
			if(val[0] === 1) {
				queue.Pause()
			}
		}
	}
	let queue = new Queue(options)

	queue.Add(generatorPromiseFunc(1))
	queue.Run()
	queue.Result().then(res => {
		console.log(res)    // [1]
	})
	```

- Pause()

	- **description**:  `Pause` will pause the queue, the `Result` method will return the result of finished task.

	- **type**: `Function`

	- **usage**:

	```js
	let options = {
		max: 1,
		interval: 1 * 1000,
		cb: (val, queue) => {
			if(val[0] === 1) {
				// the queue will be paused
				queue.Pause()
			}
		}
	}
	let queue = new Queue(options)

	queue.Add(generatorPromiseFunc(1))
		 .Add(generatorDelayPromiseFunc(2))
	queue.Run()
	queue.Result().then(res => {
		console.log(res)    // [1]
	})
	```

- Continue()

	- **description**:  `Continue` will rerun the queue, you need to call the `Result` method again to get the result of all task.

	- **type**: `Function`

	- **usage**:

	```js
	let options = {
		max: 1,
		interval: 1 * 1000,
		cb: (val, queue) => {
			if(val[0] === 1) {
				// the queue will be paused
				queue.Pause()
			}
		}
	}
	let queue = new Queue(options)

	queue.Add(generatorPromiseFunc(1))
		 .Add(generatorDelayPromiseFunc(2))
	queue.Run()
	queue.Result().then(res => {
		console.log(res)    // [1]
		queue.Continue() // the queue will rerun
		queue.Result().then(val => {
			console.log(val)    // [1, 2]
		})
	})
	```

- Stop()

	- **description**:  `Stop` will stop and reinit the queue, the result of finished task will be cleared too.

	- **type**: `Function`


