import { Options } from './types';
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
    /**
     * store options to queue
     * can be changed in Options method
     */
    constructor(options?: Options);
    /**
     * @description init queue configuration, called in new Queue and Stop() cases
     */
    private init;
    /**
     * @param {any}    requests
     * @param {number} priority
     * add request to queue
     * once add queue, the queue should be sorted again
     * Add will recursion array request
     */
    Add(requests: any, priority?: number): Queue;
    /**
     * two effects:
     * 1. transform all requests to function which return a promise
     * 2. add priority for every request to sort the queue
     */
    private handleRequest;
    private generatorRequestFunc;
    private addPriority;
    /**
     * get queue to run, genertor a final promise
     *
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
     * return the final promise
     * @return {Promise}
     */
    Result(): Promise<any>;
    /**
     * set options dynamically
     */
    Options(options: Options): void;
}
export default Queue;
