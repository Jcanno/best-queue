const STOP = 1;
const RUNNING = 2;
const PAUSE = 3;

class Queue {

	constructor(options) {
		this.interval = options.interval || 0;
		this.max = options.max || 1;
		this._queue = [];
		this._waiting = [];
		this._running = [];
		this._finished = [];
		this.promise = null;
		// this._state = STOP;
	}

	Add(task) {
		if(Array.isArray(task)) {
			this._queue.push(...task);
			this._waiting.push(...task);
		}else {
			this._queue.push(task);
			this._waiting.push(task);
		}

		return this;
	}

	Run() {
		if(this.promise === null) {
			this.promise = new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
				this.handleQueue();
			});
		}else {
			this.handleQueue();
		}
	}

	handleQueue() {
		const waits = this._waiting.length;
		const tasks = this.max <= waits ? this.max : waits;

		// this.setState(RUNNING);
		this._running.push(...this._waiting.splice(0, tasks));
		this.excute();
	}

	excute() {
		let tasks = [];

		for(let fn of this._running) {
			tasks.push(fn());
		}

		Promise.all(tasks).then(val => {
			console.log(val);
			this._finished.push(...val);
			this._running.splice(0, tasks.length);
			// this._finished.push(...this._running.splice(0, tasks.length));

			if(this._waiting.length) {
				setTimeout(() => {
					// if(!this._waiting.length) {
					// 	this.setState(STOP);
					// }
					// if(this._state !== PAUSE || this._state !== STOP) {
					// 	this.Run();
					// }
					this.Run();
				}, this.interval);
			}else {
				this.resolve(this._finished);
			}
			
		});
	}

	// setState(state) {
	// 	this._state = state;
	// }

	Result() {
		return this.promise;
	}
}

// test
// let queue = new Queue({
// 	max: 1,
// 	// autoStart: true,
// 	interval: 1 * 1000
// });

// queue.Add(() => Promise.resolve(1)).Add(() => Promise.resolve(1));
// // queue.Add(() => setTimeout(() => {
	
// // }, 1000);)
// queue.Run();

// queue.Result().then(res => {
// 	console.log(res);
	
// });
// queue.Add(() => Promise.resolve(2));
// setTimeout(() => {
// 	console.log(queue._finished);
// }, 3000);

// queue.Add([
// 	() => Promise.resolve(1),
// 	() => Promise.resolve(2),
// 	() => Promise.resolve(3),
// 	() => Promise.resolve(4),
// 	() => Promise.resolve(5),
// 	() => Promise.resolve(6),
// 	() => Promise.resolve(7)
// ]);

export default Queue;
