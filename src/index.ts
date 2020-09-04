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
	let hasFinishedCount = 0;
	let resolveFn: (v: any [] | string) => void;
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
			executeTask(currentQueue[currentIndex], currentIndex);
		}
	}
	
	/**
	 * execute single task, when a task done, put the result of task into finished
	 * run taskCb of options(taskCb may pause the queue, it's just decided by user), 
	 * so after that if state of queue is Paused, just resolve currentPromise, 
	 * if not and isLastTask is true(means queue is over), change state and resolve 
	 * currentPromise, if isLastTask is false, check currentIndex and currentState, 
	 * after waiting the inverval, check currentIndex and currentState again(we don't 
	 * know if the queue is over ater wait), then find next task by currentIndex, execute
	 * next task in a loop
	 * 
	 * @param task Current running task 
	 * @param resultIndex Make the order of finished be same to the order of queue
	 */
	function executeTask(task: Task, resultIndex: number) {
		const p: Promise<any> = task();

		if(!isPromise(p)) {
			throw new Error('every task must return a promise');
		}
		p.then(res => {
			handleSingleTaskResult(res, resultIndex);
		}).catch(err => {
			if(recordError) {
				handleSingleTaskResult((err instanceof Error) ? err : new Error(err.toString()), resultIndex);
			}else {
				setState(State.Error);
				rejectFn(err);
			}
		});
	}

	function handleSingleTaskResult(result, resultIndex) {
		hasFinishedCount++;
		finished[resultIndex] = result;
		taskCb(result, resultIndex);

		if(currentState === State.Pause || currentState === State.Init) {
			return;
		}

		if(hasFinishedCount === currentQueue.length) {
			setState(State.Finish);
			resolveFn(finished);
		}else {
			findNextAndExecute();
		}
	}

	async function findNextAndExecute() {
		if(currentIndex !== currentQueue.length - 1 && currentState === State.Running) {
			await wait(interval);
			if(currentIndex !== currentQueue.length - 1 && currentState === State.Running) {
				executeTask(currentQueue[++currentIndex], currentIndex);
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
		currentState === State.Running && setState(State.Pause);
	}

	// Get paused queue to resume
	// Should start next of currentIndex
	function resume() {
		if(currentState === State.Pause) {
			if(currentIndex === currentQueue.length - 1) {
				setState(State.Finish);
				resolveFn(finished);
				return;
			}
			setState(State.Running);
			currentIndex++;
			runTasks();
		}
	}

	// Clear queue(can called when queue is error of state)
	// Make sure queue is not running
	function clear() {
		currentQueue = [];
		currentIndex = 0;
		finished = [];
		hasFinishedCount = 0;
		setState(State.Init);
		currentPromise && resolveFn('CLEAR');
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
