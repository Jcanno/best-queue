export declare enum State {
    Init = 0,
    Running = 1,
    Pause = 2,
    Stop = 3,
    Finish = 4
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
