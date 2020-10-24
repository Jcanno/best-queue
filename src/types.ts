export type State = 'init' | 'running' | 'pause' | 'finish' | 'error'

export interface Options {
	max?: number;
	interval?: number;
	taskCb?: (res: any, index: number) => any;
	recordError?: boolean;
}

export interface Task {
  (): Promise<any>;
  [index: string]: any;
}

export type Tasks = Task[] | Task

export interface TaskWithPriority extends Task {
  priority: number;
}

export interface IExecuter {
  handle(task: TaskWithPriority, resultIndex: number): void;
}
