export enum State {
	Init = 'init',
	Running = 'running',
	Pause = 'pause',
	Finish = 'finish',
	Error = 'error'
}

export interface Options {
	max?: number;
	interval?: number;
	taskCb?: (res: any) => any;
}

export interface TaskFn {
	(): Promise<any>;
}

export type Tasks = TaskFn[] | TaskFn

export interface Task extends TaskFn {
	priority: number;
}

export interface Queue {
	getState(): State;
	add(task: Tasks, priority: number): void;
	run(): void;
	result(): Promise<any>;
	pause(): void;
	resume(): void;
	clear(): void;
}
