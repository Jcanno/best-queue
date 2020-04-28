interface Options {
    max?: number;
    interval?: number;
    cb?: Function;
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
    private init;
    /**
     * @param {any}    requests
     * @param {number} priority
     */
    Add(requests: any, priority?: number): Queue;
    /**
     * @description generatorRequestFunc、addPriority
     */
    private handleRequest;
    private generatorRequestFunc;
    private addPriority;
    /**
     * @description request will go on
     */
    Run(): void;
    private handleQueue;
    /**
     * @description sort waiting requests by priority, worked after by calling Add()
     */
    private sortWaiting;
    private excuteTask;
    Stop(): void;
    Pause(): void;
    Continue(): void;
    private setState;
    /**
     * @return {Promise}
     */
    Result(): Promise<any>;
    Options(options: Options): void;
}
export default Queue;
