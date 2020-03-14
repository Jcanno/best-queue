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

	Add(list) {
		if(Array.isArray(list)) {
			this._queue.push(...list);
			this._waiting.push(...list);
			console.log(this._waiting);
			
		}else {
			this._queue.push(list);
			this._waiting.push(list);
		}

		this._state !== RUNNING && this.autoStart && this.Run();
	}

	Run() {
		if(this._waiting.length) {
			this._running.push(...this._waiting.splice(0, this.max));
			this._state = RUNNING;
			this.excute();
		}else {
			this._state = STOP;
		}
	}

	excute() {
		let arr = [];

		for(let fn of this._running) {
			arr.push(fn());
		}

		let res = Promise.all(arr);

		res.then(val => {
			console.log(val);
			setTimeout(() => {
				this.Run();
			}, this.interval);
		});
	}
}

// test
// let queue = new Queue({
// 	max: 2,
// 	autoStart: true,
// 	interval: 5 * 1000
// });

// queue.Add([
// 	() => Promise.resolve(1),
// 	() => Promise.resolve(2),
// 	() => Promise.resolve(3),
// 	() => Promise.resolve(4),
// 	() => Promise.resolve(5),
// 	() => Promise.resolve(6)
// ]);

export default Queue;
