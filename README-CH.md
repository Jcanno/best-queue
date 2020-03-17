# **Queue-Request**

## **Api**

```js
// 生成promise 函数的通用函数
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

	- **描述**:  用于初始化 `Queue` 的属性

	- **类型**: `Object`

	- **默认值**: `{max: 1, interval: 0, cb: () => {}}`

	- **用法**:

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

	- **描述**:  每个任务中最大并发数量, 当`max`为1时, 任务会一个接着一个执行

	- **类型**: `Number`

	- **默认值**: `1`

- options.interval:

	- **描述**:  任务之间的间隔时间(毫秒)

	- **类型**: `Number`

	- **默认值**: `0`

- options.cb:

	- **描述**:  当一个任务完成时，会执行回调函数，它接收当前任务的返回值和示例`Queue`, 可以在回调函数中执行暂停队列、添加任务、检查返回值等操作
	- **类型**: `Function`

	- **默认值**: `() => {}`

- Add(task):

	- **描述**:  `Add` 接收函数或者函数数组, 函数需要返回一个`Promise`

	- **类型**: `Function<Function|Array<Function>>`

	- **用法**:

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

	// 可以传递一个函数
	queue.Add(generatorPromiseFunc(1))
	// 可以传递函数的数组
	queue.Add([
		generatorPromiseFunc(2),
		generatorPromiseFunc(3),
	])
	// 可以链式调用Add 添加任务
	queue.Add(generatorPromiseFunc(4))
		 .Add(generatorPromiseFunc(5))
	```

- Run() 

	- **描述**:  `Run` 将会执行整个队列任务

	- **类型**: `Function`

	- **用法**:

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

	- **描述**:  `Result` 返回一个`Promise`, 当队列执行完毕时会返回整个队列的结果

	- **类型**: `Function`

	- **用法**:

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

	- **描述**:  `Pause` 会暂停队列, 此时的`Result`方法会返回当前已执行任务的结果

	- **类型**: `Function`

	- **用法**:

	```js
	let options = {
		max: 1,
		interval: 1 * 1000,
		cb: (val, queue) => {
			if(val[0] === 1) {
				// 队列将会暂停
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

	- **描述**:  `Continue` 会继续执行队列，此时需要再次调用`Result`方法来获取所有任务的结果

	- **类型**: `Function`

	- **用法**:

	```js
	let options = {
		max: 1,
		interval: 1 * 1000,
		cb: (val, queue) => {
			if(val[0] === 1) {
				// 队列将会暂停
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
		queue.Continue() // 队列将会继续运行
		queue.Result().then(val => {
			console.log(val)    // [1, 2]
		})
	})
	```

- Stop()

	- **描述**:  `Stop` 会停止并且重新初始化整个队列，`Result`的返回值也会被清空

	- **类型**: `Function`


