export enum State {
	Init,
	Running,
	Pause,
	Finish,
	Error
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
