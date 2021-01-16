import { State, Options, Subscribe, Listener, Dispatch } from "./types";
import { wait } from "./utils/wait";
import Executer from "./executer";

function createQueue<R = any, E = any>(
  tasks: unknown[],
  options: Options = {}
) {
  const finished = [];
  const currentQueue: unknown[] = Array.isArray(tasks) ? [...tasks] : [tasks];
  const listeners = new Set<Listener>();
  let { max = 1, interval = 0, recordError = false } = options;
  let currentState: State = "init";
  let currentIndex = 0;
  let hasFinishedCount = 0;
  let resolveFn: (v: R[]) => void = () => undefined;
  let rejectFn: (e: E) => void = () => undefined;

  // Make max to an integer
  max = (max = max >> 0) < 1 ? 1 : max;
  // Make interval to an integer
  interval = (interval = interval >> 0) < 0 ? 0 : interval;

  function promiseExecuter(resolve: (v: R[]) => void, reject: (e: E) => void) {
    resolveFn = resolve;
    rejectFn = reject;

    runTasks();
  }

  // Called first run and resume cases
  function runTasks() {
    const totalTasks = currentQueue.length;
    const restTasks = totalTasks - currentIndex;
    const concurrency = max >= restTasks ? restTasks : max;
    const startIndex = currentIndex;

    setState("running");

    for (let i = 0; i < concurrency; i++) {
      currentIndex = startIndex + i;
      executer.handle(currentQueue[currentIndex], currentIndex);
    }
  }

  function onSuccess(res: any, resultIndex: number) {
    handleSingleTaskResult(res, resultIndex);
  }

  function onError(err: any, resultIndex: number) {
    if (!!recordError) {
      handleSingleTaskResult(
        err instanceof Error ? err : new Error(err.toString()),
        resultIndex
      );
    } else {
      setState("error");
      rejectFn(err);
    }
  }

  function handleSingleTaskResult(result, resultIndex) {
    hasFinishedCount++;
    finished[resultIndex] = result;
    const hasFinished = hasFinishedCount === currentQueue.length;

    if (currentState === "pause" || currentState === "init") {
      return;
    }

    if (hasFinished) {
      setState("finish");
      resolveFn(finished);
    } else {
      next();
    }
  }

  async function next() {
    const hasNextTask =
      currentIndex < currentQueue.length - 1 && currentState === "running";

    if (hasNextTask) {
      await wait(interval);
      hasNextTask &&
        executer.handle(currentQueue[++currentIndex], currentIndex);
    }
  }

  const subscribe: Subscribe = function subscribe(listener: Listener) {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  const dispatch: Dispatch = function dispatch(taskStatus, data, resultIndex) {
    listeners.forEach((listener) => {
      listener(
        taskStatus,
        data,
        resultIndex,
        hasFinishedCount / createQueue.length
      );
    });
  };

  const executer = new Executer(dispatch);

  // Change state of queue
  function setState(nextState: State): void {
    currentState = nextState;
  }

  // Pause the running queue
  function pause() {
    currentState === "running" && setState("pause");
  }

  // Get paused queue to resume
  // Should start next of currentIndex
  function resume() {
    if (currentState === "pause") {
      if (currentIndex === currentQueue.length - 1) {
        setState("finish");
        resolveFn(finished);
        return;
      }
      setState("running");
      currentIndex++;
      runTasks();
    }
  }

  /**
   * @returns {State} get the state of queue
   */
  function getState(): State {
    return currentState;
  }

  subscribe((taskStatus, data, index) => {
    taskStatus === "success" ? onSuccess(data, index) : onError(data, index);
  });

  const enhanceQueueApi = {
    pause,
    resume,
    getState,
    subscribe,
  };

  const queue = Object.assign(new Promise(promiseExecuter), enhanceQueueApi);

  return queue;
}

export type Queue = ReturnType<typeof createQueue>;

export { createQueue };
