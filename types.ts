export enum State {
	Init,
	Running,
	Pause,
	Stop,
	Finish
}

export interface Options {
	max?: number;
	interval?: number;
	cb?: Function;
}

export interface RequestFn {
	(): Promise<any>;
}

export interface Request extends RequestFn {
	priority: number;
}
