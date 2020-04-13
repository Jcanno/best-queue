declare enum State {
    Init = 1,
    Running = 2,
    Pause = 3,
    Stop = 4,
    Finish = 5
}
interface Options {
    max?: number;
    interval?: number;
    cb?: Function;
}
interface RequestFn {
    (): Record<string, any>;
}
interface Request {
    (): Record<string, any>;
    priority: number;
}
declare class Queue {
    options: Options;
    interval: number;
    max: number;
    cb: Function;
    private _queue;
    private _waiting;
    private _running;
    private _finished;
    private _promise;
    private _state;
    private _needSort;
    private resolve;
    private reject;
    constructor(options?: Options);
    /**
     * @description init queue configuration, called in new Queue and Stop() cases
     */
    init(): void;
    /**
     * @param {any}    requests
     * @param {number} priority
     */
    Add(requests: any, priority?: number): Queue;
    /**
     * @description generatorRequestFunc、addPriority
     */
    handleRequest(request: any, priority: number): void;
    generatorRequestFunc(request: any): RequestFn;
    addPriority(requestFn: RequestFn, priority: number): Request;
    /**
     * @description request will go on
     */
    Run(): void;
    handleQueue(): void;
    /**
     * @description sort waiting requests by priority, worked after by calling Add()
     */
    sortWaiting(): void;
    excuteTask(): void;
    Stop(): void;
    Pause(): void;
    Continue(): void;
    setState(state: State): void;
    /**
     * @return {Promise}
     */
    Result(): Promise<any>;
}
export default Queue;
