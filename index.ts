import { State, Options, TaskFn, Task, Tasks } from './types';

const noop: () => void = function() {};

function createQueue(options: Options) {
	const { max = 1, interval = 0, taskCb = noop } = options;
	const finished = [];
	let queue: Task[] = [];
	let currentPromise: Promise<any> = null;
	let needSort = false;
	let currentState: State = State.Init;
	let resolveFn: (v: any []) => void;
	let rejectFn: (v: any []) => void;
	let currentIndex = 0;

	// 判断传入的配置类型
	if(typeof max !== 'number' || typeof interval !== 'number' || typeof taskCb !== 'function') {
		throw new TypeError(`
			Except max, interval to be a number, taskCb to be a function
		`);
	}

	/**
	 * 添加任务到队列中
	 * @param tasks			 需要处理的任务
	 * @param priority   任务优先级，默认为零，数值越大越优先处理
	 */
	function add(tasks: Tasks, priority = 0) {
		if(tasks) {
			needSort = true;
			if(Array.isArray(tasks)) {
				tasks.forEach(task => add(task, priority));
			}else {
				// 每个任务都是返回promise的函数
				if(typeof tasks !== 'function') {
					throw new TypeError(`
						every task must be a function which return a promise
					`);
				}
				const task = addPriority(tasks, priority);

				queue.push(task);
			}
		}
	}

	// 给每个任务添加优先级
	function addPriority(tasks: TaskFn, priority): Task {
		priority = typeof priority === 'number' ? priority : 0;
		const task = tasks as Task;

		task.priority = priority;
		return task;
	}

	// 执行队列
	function run() {
		if(currentState !== State.Running && (currentPromise === null || currentState === State.Finish)) {
			currentPromise = new Promise((resolve, reject) => {
				resolveFn = resolve;
				rejectFn = reject;
				handleQueue();
			});
		}
	}

	// 处理队列中的数据
	function handleQueue() {
		needSort && sortQueue();
		setState(State.Running);
		runTasks();
	}

	// 给任务排序
	function sortQueue() {
		queue.sort((a, b) => b.priority - a.priority);
		needSort = false;
	}

	function excuteTask(task: Task, isLastTask: boolean, resultIndex: number) {
		const p = task();

		if(p.then === undefined) {
			throw new Error(`
				every task must return a promise
			`);
		}
		p.then(async res => {
			finished[resultIndex] = res;
			taskCb(res);
			if(currentState === State.Pause) {
				resolveFn(finished);
				return;
			}
			if(isLastTask) {
				setState(State.Finish);
				resolveFn(finished);
			}else {
				if(currentIndex !== queue.length - 1 && currentState === State.Running) {
					await new Promise(r => {
						setTimeout(() => {
							r();
						}, interval);
					});
					if(currentIndex !== queue.length - 1 && currentState === State.Running) {
						const nextTask = queue[++currentIndex];
						
						excuteTask(nextTask, currentIndex === queue.length - 1, currentIndex);
					}
				}
			}
		}).catch(err => {
			setState(State.Error);
			rejectFn(err);
		});
	}

	function runTasks() {
		const totalTasks = queue.length;

		for(let i = currentIndex ? currentIndex : 0; i < (max >= totalTasks ? totalTasks : max); i++) {
			currentIndex = i;
			// 处理每一个任务
			excuteTask(queue[currentIndex], currentIndex === totalTasks - 1, i);
		}
	}

	function setState(nextState: State): void {
		currentState = nextState;
	}

	function result(): Promise<any> {
		if(currentPromise === null) {
			throw new Error(`
				should add task and run the queue
			`);
		}
		return currentPromise;
	}

	function pause() {
		if(currentState === State.Running) {
			setState(State.Pause);
		}
	}

	function resume() {
		if(currentState === State.Pause) {
			currentPromise = new Promise((resolve, reject) => {
				resolveFn = resolve;
				rejectFn = reject;
			});
			runTasks();
		}
	}

	function clear() {
		queue = [];
		currentPromise = Promise.resolve([]);
	}

	return {
		run,
		add,
		result,
		pause,
		resume,
		clear
	};
}

export {
	createQueue
};
