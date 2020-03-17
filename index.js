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

		this.setState(RUNNING);
		this._running.push(...this._waiting.splice(0, tasks));
		this.excuteTask();
	}

	excuteTask() {
		let tasks = [];

		for(let fn of this._running) {
			typeof fn === 'function' ? tasks.push(fn()) : tasks.push(Promise.resolve(fn));
		}

		Promise.all(tasks).then(val => {
			this._finished.push(...val);
			this._running.splice(0, tasks.length);
			typeof this.cb === 'function' && this.cb(val, this);
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
		});
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
		if(this._promise === null) {
			return Promise.resolve([]);
		}else {
			return this._promise;
		}
	}
}

export default Queue;
