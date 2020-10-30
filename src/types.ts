export type State = "init" | "running" | "pause" | "finish" | "error";

export interface Options {
  max?: number;
  interval?: number;
  taskCb?: (res: any, index: number) => any;
  recordError?: boolean;
}

export interface TaskNode {
  handle: unknown;
  priority: number;
  [index: string]: any;
}

export interface IExecuter {
  handle(taskNode: TaskNode, resultIndex: number): void;
}
