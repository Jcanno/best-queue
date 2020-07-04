import { Options, Tasks } from './types';
declare function createQueue(options: Options): {
    run: () => void;
    add: (tasks: Tasks, priority?: number) => void;
    result: () => Promise<any>;
    pause: () => void;
    resume: () => void;
    clear: () => void;
};
export { createQueue };
