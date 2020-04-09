import axios from 'axios';

enum State {
	Init = 1,
	Running,
	Pause,
	Stop,
	Finish
}
const noop: () => void = function() {};
const urlReg = /^((https?|ftp|file):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

interface Options {
	max?: number,
	interval?: number,
	cb?: Function
}

interface RequestFn {
	(): Object
}

interface Request {
	requestFn: RequestFn,
	priority: number
}

class Queue {
	options: Options;
	interval: number;
	max: number;
	cb: Function;
	private _queue: Array<Request>;
	private _waiting: Array<Request>;
	private _running: Array<Request>;
	private _finished: Array<any>;
	private _promise: Promise<any>
	private _state: State;
	private _needSort: boolean;
	private resolve: (v: Array<any>) => void;
	private reject: (v: Array<any>) => void;

	constructor(options: Options = {}) {
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
		this.setState(State.Init);
	}

	/**
	 * @param {any}    requests 
	 * @param {number} priority 
	 */
	Add(requests: any, priority = 0): Queue {
		if(requests) {
			this._needSort = true;
			if(Array.isArray(requests)) {
				requests.forEach(request => {
					this.Add(request, priority)
				})
			}else {
				this.handleRequest(requests, priority)
			}
		}

		return this;
	}

	/**
	 * @description generatorRequestFunc、addPriority
	 */
	handleRequest(request: any, priority: number): void {
		const requestFn: RequestFn = this.generatorRequestFunc(request);
		const excutedRequestFn: Request = this.addPriority(requestFn, priority);
		this._queue.push(excutedRequestFn);
		this._waiting.push(excutedRequestFn);
	}

	// transform request to function in order to add priority and get promise func
	generatorRequestFunc(request: any): RequestFn {
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

	addPriority(requestFn: RequestFn, priority: number): Request {
		priority = typeof priority === 'number' ? priority : 0;
		const request: Request = {
			requestFn,
			priority
		}

		return request;
	}

	/**
	 * @description request will go on 
	 */
	Run(): void {
		if(this._state !== State.Running && (this._promise === null || this._state === State.Finish)) {
			this._promise = new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
				this.handleQueue();
			});
		}
	}

	handleQueue(): void {
		const waits: number = this._waiting.length;
		const requestNum: number = this.max <= waits ? this.max : waits;

		if(waits) {
			this.setState(State.Running);
			this._needSort && this.sortWaiting();
			this._running.push(...this._waiting.splice(0, requestNum));
			this.excuteTask();
		}
	}

	/**
	 * @description sort waiting requests by priority, worked after by calling Add()
	 */
	sortWaiting(): void {
		this._waiting.sort((a, b) => b.priority - a.priority);
		this._needSort = false;
	}

	excuteTask(): void {
		let requests: Array<Object> = [];

		for(let request of this._running) {
			requests.push(request.requestFn())
		}

		const tlength = requests.length;
		
		Promise.all(requests).then(result => {
			this._finished.push(...result);
			this._running.splice(0, tlength);
			typeof this.cb === 'function' && this.cb(result, this);
			if(this._state === State.Pause) {
				this.resolve(this._finished);
				return;
			}
			if(this._waiting.length) {
				setTimeout(() => {
					this.handleQueue();
				}, this.interval);
			}else {
				this.setState(State.Finish);
				this.resolve(this._finished);
			}
		}).catch(err => {
			this.reject(err);
		});
	}

	Stop(): void {
		this.setState(State.Stop);
		this.init();
	}

	Pause(): void {
		if(this._state === State.Running) {
			this.setState(State.Pause);
		}
	}

	Continue(): void {
		if(this._state === State.Pause) {
			this._promise = new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
			});
			this.handleQueue();
		}
	}

	setState(state: State): void {
		this._state = state;
	}

	/**
	 * @return {Promise} 
	 */
	Result(): Promise<any> {
		return this._promise === null ? Promise.resolve([]) : this._promise;
	}
}

export default Queue;