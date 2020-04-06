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
		this.max = this.max > 1 ? this.max : 1;
		this.cb = this.options.cb || noop;
		this._queue = [];
		this._waiting = [];
		this._running = [];
		this._finished = [];
		this._promise = null;
		this.setState(INIT);
	}

	/**
	 * @param {any}    requests 
	 * @param {number} priority 
	 */
	Add(requests, priority = 0) {
		if(requests) {
			this._needSort = true;
			if(Array.isArray(requests)) {
				requests.forEach(request => {
					this.Add(request, priority)
				})
			}else {
				this.handleTask(requests, priority)
			}
		}

		return this;
	}

	/**
	 * @description generatorRequestFunc、addPriority
	 */
	handleTask(request, priority) {
		request = this.generatorRequestFunc(request);
		request.priority = typeof priority === 'number' ? priority : 0;
		this._queue.push(request);
		this._waiting.push(request);
	}

	/**
	 * @description sort waiting requests by priority, worked after by calling Add()
	 */
	sortWaiting() {
		this._waiting.sort((a, b) => b.priority - a.priority);
		this._needSort = false;
	}

	// transform request to function in order to add priority and get promise func
	generatorRequestFunc(request) {
		if(typeof request !== 'function') {
			let axiosConfig;
			if(typeof request === 'string' && urlReg.test(request)) {
				axiosConfig = {
					url: request,
					method: 'get'
				}
			}else if(typeof request === 'object' && request.url) {
				axiosConfig = request;
			}else {
				return function() {
					return request;
				}
			}
			return function() {
				return axios(axiosConfig)
			}
		}else {
			return request;
		}
	}

	/**
	 * @description request will go on 
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
		const requests = this.max <= waits ? this.max : waits;

		if(waits) {
			this.setState(RUNNING);
			this._needSort && this.sortWaiting();
			this._running.push(...this._waiting.splice(0, requests));
			this.excuteTask();
		}
	}

	excuteTask() {
		let requests = [];

		for(let fn of this._running) {
			requests.push(fn())
		}

		let tlength = requests.length;
		
		Promise.all(requests).then(result => {
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
