const STOP = 'stop';
const RUNNING = 'running';
const PAUSE = 'pause';
const RERUNNING = 'rerunning';

class Queue {

	constructor(options) {
		this.options = options;
		this.init();
	}

	init() {
		this.interval = this.options.interval || 0;
		this.max = this.options.max || 1;
		this.cb = this.options.cb;
		this._queue = [];
		this._waiting = [];
		this._running = [];
		this._finished = [];
		this._promise = null;
		this._state = STOP;
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
		if(this._promise === null || this._state === RERUNNING) {
			this._promise = new Promise((resolve, reject) => {
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

		this.setState(RUNNING);
		this._running.push(...this._waiting.splice(0, tasks));
		this.excuteTask();
	}

	excuteTask() {
		let tasks = [];

		for(let fn of this._running) {
			if(typeof fn === 'function') {
				tasks.push(fn());
			}else {
				tasks.push(Promise.resolve(fn));
			}
		}

		Promise.all(tasks).then(val => {
			console.log(val);
			this._finished.push(...val);
			this._running.splice(0, tasks.length);
			typeof this.cb === 'function' && this.cb(val);
			if(this._state === PAUSE || this._state === STOP) {
				this.resolve(this._finished);
				return;
			}
			if(this._waiting.length) {
				setTimeout(() => {
					this._state !== PAUSE && this.Run();
				}, this.interval);
			}else {
				this.resolve(this._finished);
			}
			
		});
	}

	Stop() {
		this.setState(STOP);
		this.init();
	}

	Pause() {
		this.setState(PAUSE);
	}

	Continue() {
		this.setState(RERUNNING);
		this.Run();
	}

	setState(state) {
		this._state = state;
	}

	Result() {
		return this._promise;
	}

	// Clear(options) {
	// 	this.init(options);
	// }
}

// test
// let queue = new Queue({
// 	max: 1,
// 	interval: 1 * 1000,
// 	cb: val => {
// 		if((val[0] === 1)) {
// 			console.log('it is 1');
			
// 		}
// 	}
// });

// queue.Add(() => new Promise(r => {
// 	setTimeout(() => {
// 		r(1);
// 	}, 1000);
// }))
// 	.Add(() => Promise.resolve(2));
// // queue.Add(() => setTimeout(() => {
	
// // }, 1000);)
// queue.Run();

// queue.Result().then(res => {
// 	console.log('====================================');
// 	console.log(res);
// 	console.log('====================================');
// });

// queue.Pause();
export default Queue;
