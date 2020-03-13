
class Queue {

	constructor(options) {
		this.interval = options.interval;
		this.concurrence = options.concurrence;
		this.autoStart = options.autoStart;
		this._queue = [];
		this._waiting = [];
		this._running = [];
		this._finished = [];
	}

	Add(list) {
		if(Array.isArray(list)) {
			this._queue.concat(list);
			this._waiting.concat(list);
		}else {
			this._queue.push(list);
			this._waiting.push(list);
		}
	}

}

module.export = Queue;
