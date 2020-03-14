const STOP = 1;
const RUNNING = 2;
const PAUSE = 3;

class Queue {

	constructor(options) {
		this.interval = options.interval;
		this.max = options.max;
		this.autoStart = options.autoStart;
		this._queue = [];
		this._waiting = [];
		this._running = [];
		this._finished = [];
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

		this._state !== RUNNING && this.autoStart && this.Run();
	}

	Run() {
		const waits = this._waiting.length;

		if(waits) {
			const tasks = this.max < waits ? this.max : waits;

			this._state = RUNNING;
			this._running.push(...this._waiting.splice(0, tasks));
			this.excute();
		}else {
			this._state = STOP;
		}
	}

	excute() {
		let tasks = [];

		for(let fn of this._running) {
			tasks.push(fn());
		}

		Promise.all(tasks).then(val => {
			console.log(val);
			this._finished.push(...this._running.splice(0, tasks.length));

			setTimeout(() => {
				if(this._state !== PAUSE || this._state !== STOP) {
					this.Run();
				}
			}, this.interval);
		});
	}
}

// test
// let queue = new Queue({
// 	max: 2,
// 	autoStart: true,
// 	interval: 1 * 1000
// });

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
