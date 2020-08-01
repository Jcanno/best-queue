import { Queue, State, Options, Task, Tasks } from './types';
import { isPromise, addPriority, wait, noop } from './utils';

function createQueue(options: Options): Queue {
	if(!options) {
		throw new Error('options is required');
	}
	let finished: any [] = [];
	let { max = 1, interval = 0, taskCb = noop, recordError = false } = options;
	let needSort = false;
	let currentQueue: Task[] = [];
	let currentPromise: Promise<any> = null;
	let currentState: State = State.Init;
	let currentIndex = 0;
	let resolveFn: (v: any []) => void;
	let rejectFn: (v: any) => void;

	// Inspect type of max, interval, taskCb
	if(typeof max !== 'number' || typeof interval !== 'number' || typeof taskCb !== 'function') {
		throw new TypeError('Except max, interval to be a number, taskCb to be a function');
	}

	// Max should be equal or greater than 1, and interval should't less than 0
	if(max < 1 || interval < 0) {
		throw new Error('Except max min to 1, interval min to 0');
	}

	// Make max to an integer, same effect with parseInt()
	max = max >> 0;
	// Make recordError to boolean
	recordError = !!recordError;
	/**
	 * Add task to queue
	 * @param tasks			 Task that need to handle
	 * @param priority   Default to 0, the bigger priority of task, the more preferential to handle
	 */
	function add(tasks: Tasks, priority = 0) {
		if(tasks) {
			needSort = true;
			if(Array.isArray(tasks)) {
				tasks.forEach(task => add(task, priority));
			}else {
				if(typeof tasks !== 'function') {
					throw new TypeError('every task must be a function which return a promise');
				}
				const task = addPriority(tasks, priority);

				currentQueue.push(task);
			}
		}
	}

	// Run the queue
	function run() {
		if(currentState !== State.Running && currentPromise === null) {
			currentPromise = new Promise((resolve, reject) => {
				resolveFn = resolve;
				rejectFn = reject;
				handleQueue();
			});
		}
	}

	// Sort queue and start to run tasks
	function handleQueue() {
		needSort && sortQueue();
		runTasks();
	}

	// Sort queue by the priority of every task
	function sortQueue() {
		currentQueue.sort((a, b) => b.priority - a.priority);
		needSort = false;
	}

	// Called first run and resume cases
	function runTasks() {
		const totalTasks = currentQueue.length;
		const restTasks = totalTasks - currentIndex;
		const startIndex = currentIndex;

		setState(State.Running);
		
		for(let i = 0; i < (max >= restTasks ? restTasks : max); i++) {
			currentIndex = startIndex + i;
			excuteTask(currentQueue[currentIndex], currentIndex);
		}
	}

	/**
	 * Excute single task, when a task done, put the result of task into finished
	 * run taskCb of options(taskCb may pause the queue, it's just decided by user), 
	 * so after that if state of queue is Paused, just resolve currentPromise, 
	 * if not and isLastTask is true(means queue is over), change state and resolve 
	 * currentPromise, if isLastTask is false, check currentIndex and currentState, 
	 * after waiting the inverval, check currentIndex and currentState again(we don't 
	 * know if the queue is over ater wait), then find next task by currentIndex, excute
	 * next task in a loop
	 * 
	 * @param task Current running task 
	 * @param resultIndex Make the order of finished be same to the order of queue
	 */
	function excuteTask(task: Task, resultIndex: number) {
		const p: Promise<any> = task();
		const isLastTask = resultIndex === currentQueue.length - 1;

		if(!isPromise(p)) {
			throw new Error('every task must return a promise');
		}
		p.then(res => {
			finished[resultIndex] = res;
			taskCb(res);
			if(currentState === State.Pause) {
				isLastTask && setState(State.Finish);
				resolveFn(finished);
				return;
			}

			if(isLastTask) {
				setState(State.Finish);
				resolveFn(finished);
			}else {
				findNextAndExcute();
			}
		}).catch(err => {
			if(recordError) {
				finished[resultIndex] = (err instanceof Error) ? err : new Error(err.toString());
				if(isLastTask) {
					setState(State.Finish);
					resolveFn(finished);
				}else {
					findNextAndExcute();
				}
			}else {
				setState(State.Error);
				rejectFn(err);
			}
		});
	}

	async function findNextAndExcute() {
		if(currentIndex !== currentQueue.length - 1 && currentState === State.Running) {
			await wait(interval);
			if(currentIndex !== currentQueue.length - 1 && currentState === State.Running) {
				const nextTask = currentQueue[++currentIndex];
				
				excuteTask(nextTask, currentIndex);
			}
		}
	}

	// change state of queue
	function setState(nextState: State): void {
		currentState = nextState;
	}

	// TODO: can add params to result, just start queue
	/**
	 * @returns {Promise} 
	 */
	function result(): Promise<any> {
		if(currentPromise === null) {
			throw new Error('should add task and run the currentQueue');
		}
		return currentPromise;
	}

	// Pause the running queue
	function pause() {
		if(currentState === State.Running) {
			setState(State.Pause);
		}
	}

	// Get paused queue to resume
	// Should start next of currentIndex
	function resume() {
		if(currentState === State.Pause) {
			currentIndex++;
			currentPromise = new Promise((resolve, reject) => {
				resolveFn = resolve;
				rejectFn = reject;
				runTasks();
			});
		}
	}

	// Clear queue(can called when queue is error of state)
	// Make sure queue is not running
	function clear() {
		if(currentState === State.Running || currentState ===  State.Pause) {
			resolveFn(finished);
		}
		currentQueue = [];
		currentIndex = 0;
		finished = [];
		setState(State.Init);
	}

	/**
	 * @returns {State} get the state of queue
	 */
	function getState(): State {
		return currentState;
	}

	const queue = {
		run,
		add,
		result,
		pause,
		resume,
		clear,
		getState
	};

	return queue;
}

export {
	createQueue
};
