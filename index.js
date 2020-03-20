const STOP = 'stop';
const RUNNING = 'running';
const PAUSE = 'pause';
const INIT = 'init';
const FINISH = 'finish';
const noop = () => {};

class Queue {

	constructor(options) {
		this.options = options;
		this.init();
	}

	init() {
		this.interval = this.options.interval || 0;
		this.max = this.options.max || 1;
		this.cb = this.options.cb || noop;
		this._queue = [];
		this._waiting = [];
		this._running = [];
		this._finished = [];
		this._promise = null;
		this.setState(INIT);
	}

	Add(task, priority = 0) {
		if(task) {
			if(Array.isArray(task)) {
				this._queue.push(...task);
				for(let i = 0; i < task.length; i++) {
					this.addPriority(task[i], priority);
					this._waiting.push(task[i]);
				}
			}else {
				this._queue.push(task);
				this._waiting.push(task);
				this.addPriority(task, priority);
			}
		}

		return this;
	}

	sortWaiting() {
		this._waiting.sort((a, b) => b.priority - a.priority);
	}

	addPriority(value, priority) {
		typeof priority !== 'number' && (priority = 0);
		let obj;

		this.needToObject(value) ? obj = new Object(value) : obj = value;
		obj.priority = priority;
		return obj;
	}

	needToObject(value) {
		return (
			value === null ||
			typeof value === 'string' ||
			typeof value === 'number' ||
			typeof value === 'symbol' ||
			typeof value === 'boolean'
		);
	}

	Run() {
		if(this._state !== RUNNING && (this._promise === null || this._state === FINISH)) {
			this._promise = new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
				this.handleQueue();
			});
		}
	}

	handleQueue() {
		const waits = this._waiting.length;
		const tasks = this.max <= waits ? this.max : waits;

		if(waits) {
			this.setState(RUNNING);
			this.sortWaiting();
			this._running.push(...this._waiting.splice(0, tasks));
			this.excuteTask();
		}
	}

	excuteTask() {
		let tasks = [];
		let tlength = tasks.length;

		for(let fn of this._running) {
			typeof fn === 'function' ? tasks.push(fn()) : tasks.push(Promise.resolve(fn));
		}

		// TODO: excute promise reject
		let i = 0;
		let result = [];

		while(i < tlength) {
			let task = tasks[i];

			task.then(val => {
				result.push(val);
			}).catch(err => {
				this.reject(err);
				return;
			});
			i++;
		}

		// Promise.all(tasks).then(val => {
		this._finished.push(...result);
		this._running.splice(0, tlength);
		typeof this.cb === 'function' && this.cb(result, this);
		if(this._state === PAUSE) {
			this.resolve(this._finished);
			return;
		}
		if(this._waiting.length) {
			setTimeout(() => {
				this.handleQueue();
			}, this.interval);
		}else {
			this.setState(FINISH);
			this.resolve(this._finished);
		}
		// });
	}

	Stop() {
		this.setState(STOP);
		this.init();
	}

	Pause() {
		if(this._state === RUNNING) {
			this.setState(PAUSE);
		}
	}

	Continue() {
		if(this._state === PAUSE) {
			this._promise = new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
			});
			this.handleQueue();
		}
	}

	setState(state) {
		this._state = state;
	}

	Result() {
		return this._promise === null ? Promise.resolve([]) : this._promise;
	}
}

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

let options = {
	max: 1,
	interval: 1 * 1000,
	cb: (val, queue) => {
		if(val[0] === 1) {
			// 队列将会暂停
			queue.Pause();
		}
	}
};
let queue = new Queue(options);

queue.Add(generatorPromiseFunc(1))
	 .Add(generatorDelayPromiseFunc(2));
queue.Run();
queue.Result().then(res => {
	console.log(res);    // [1]
});
// export default Queue;
