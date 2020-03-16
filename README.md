# **Queue-Request**

### **APIs**

- options:

	- **despcrition**:  the property to initialize `Queue`

	- **type**: `Object`

	- **default**: `{}`

	- **usage**:

	```js
	let options = {
		max: 5,
		interval: 1 * 1000,
		cb: val => {
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

	- **description**:  the callback when a task finished, it receives one Array what is the result of this task. You can `Pause`、`Add` the queue, of cource, you can do something else like check the result and filter it

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
		cb: val => {
			if(val[0] === 1) {
				queue.Pause()
			}
		}
	}
	let queue = new Queue(options)

	// you can transmit Function
	queue.Add(() => Promise.resolve(1))
	// you can transmit Array of Function
	queue.Add([
		() => Promise.resolve(2),
		() => Promise.resolve(3),
	])
	// you can also chain call method Add
	queue.Add(() => Promise.resolve(4))
		 .Add(() => Promise.resolve(5))
	```

- Run() 

	- **description**:  `Run` will start the queue.

	- **type**: `Function`

	- **usage**:

	```js
	let options = {
		max: 5,
		interval: 1 * 1000,
		cb: val => {
			if(val[0] === 1) {
				queue.Pause()
			}
		}
	}
	let queue = new Queue(options)

	queue.Add(() => Promise.resolve(1))
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
		cb: val => {
			if(val[0] === 1) {
				queue.Pause()
			}
		}
	}
	let queue = new Queue(options)

	// you can transmit Function
	queue.Add(() => Promise.resolve(1))
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
		cb: val => {
			if(val[0] === 1) {
				// the queue will be paused
				queue.Pause()
			}
		}
	}
	let queue = new Queue(options)

	queue.Add(() => Promise.resolve(1))
		 .Add(() => new Promise(r => {
			setTimeout(() => {
				r(2);
			}, 1000);
		}))
	queue.Run()
	queue.Result().then(res => {
		console.log(res)    // [1]
	})
	```

- Continue()

	- **description**:  `Continue` will rerun the queue, we can call the `Result` method again, it will return the result of all task.

	- **type**: `Function`

	- **usage**:

	```js
	let options = {
		max: 1,
		interval: 1 * 1000,
		cb: val => {
			if(val[0] === 1) {
				// the queue will be paused
				queue.Pause()
			}
		}
	}
	let queue = new Queue(options)

	queue.Add(() => Promise.resolve(1))
		 .Add(() => new Promise(r => {
			setTimeout(() => {
				r(2);
			}, 1000);
		}))
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

	- **description**:  `Stop` will stop and reinit the queue, the result of finished task will be clear too.

	- **type**: `Function`
