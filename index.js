import axios from 'axios';

const STOP = 'stop';
const RUNNING = 'running';
const PAUSE = 'pause';
const INIT = 'init';
const FINISH = 'finish';
const noop = () => {};
const urlReg = /^((https?|ftp|file):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
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
			this._needSort = true;
			if(Array.isArray(task)) {
				this._queue.push(...task);
				for(let i = 0; i < task.length; i++) {
					task = this.generatorRequestFunc(task[i]);
					task['priority'] = priority;
					this._waiting.push(task[i]);
				}
			}else {
				this._queue.push(task);
				task = this.generatorRequestFunc(task);
				task['priority'] = priority;
				this._waiting.push(task);
			}
		}

		return this;
	}

	sortWaiting() {
		this._waiting.sort((a, b) => b.priority - a.priority);
		this._needSort = false;
	}

	// transform task to function in order to add priority and get promise func
	generatorRequestFunc(task) {
		if(typeof task !== 'function') {
			let axiosConfig;
			if(typeof task === 'string' && urlReg.test(task)) {
				axiosConfig = {
					url: task,
					method: 'get'
				}
			}else if(typeof task === 'object' && task.url) {
				axiosConfig = task;
			}else {
				return function() {
					return task;
				}
			}
			return function() {
				return axios(axiosConfig)
			}
		}
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
			this._needSort && this.sortWaiting();
			this._running.push(...this._waiting.splice(0, tasks));
			this.excuteTask();
		}
	}

	excuteTask() {
		let tasks = [];

		for(let fn of this._running) {
			tasks.push(fn())
		}

		let tlength = tasks.length;
		
		Promise.all(tasks).then(result => {
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
		}).catch(err => {
			this.reject(err);
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
		return this._promise === null ? Promise.resolve([]) : this._promise;
	}
}

export default Queue;
