import axios from 'axios';

const STOP = 'stop';
const RUNNING = 'running';
const PAUSE = 'pause';
const INIT = 'init';
const FINISH = 'finish';
const noop = function() {};
const urlReg = /^((https?|ftp|file):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
class Queue {

	constructor(options = {}) {
		this.options = options;
		this.init();
	}

	/**
	 * @description init queue configuration, called in new Queue and Stop() cases
	 */
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

	/**
	 * @param task {any} 
	 */
	Add(task, priority = 0) {
		if(task) {
			this._needSort = true;
			if(Array.isArray(task)) {
				for(let i = 0; i < task.length; i++) {
					task[i] = this.handleTask(task[i], priority)
				}
			}else {
				task = this.handleTask(task, priority)
			}
		}

		return this;
	}

	/**
	 * @description generatorRequestFunc、addPriority
	 */
	handleTask(task, priority) {
		task = this.generatorRequestFunc(task);
		task['priority'] = typeof priority === 'number' ? priority : 0;
		this._queue.push(task);
		this._waiting.push(task);
		return task;
	}

	/**
	 * @description sort waiting task by priority, worked after by calling Add()
	 */
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

	/**
	 * @description task will go on 
	 */
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

	/**
	 * @returns {Promise} 
	 */
	Result() {
		return this._promise === null ? Promise.resolve([]) : this._promise;
	}
}

export default Queue;
