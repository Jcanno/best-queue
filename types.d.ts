export declare enum State {
    Init = 0,
    Running = 1,
    Pause = 2,
    Stop = 3,
    Finish = 4,
    Error = 5
}
export interface Options {
    max?: number;
    interval?: number;
    taskCb?: (res: any) => any;
}
export interface TaskFn {
    (): Promise<any>;
}
export declare type Tasks = TaskFn[] | TaskFn;
export interface Task extends TaskFn {
    priority: number;
}
