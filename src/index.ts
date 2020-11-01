import { State, Options, TaskNode } from "./types";
import { wait } from "./utils/wait";
import Executer from "./executer";

const noop: () => void = function () {};

function createQueue(options: Options) {
  if (!options) {
    throw new Error("options is required");
  }
  let finished = [];
  let { max = 1, interval = 0, taskCb = noop, recordError = false } = options;
  let needSort = false;
  let currentQueue: TaskNode[] = [];
  let currentPromise: Promise<any> = null;
  let currentState: State = "init";
  let currentIndex = 0;
  let hasFinishedCount = 0;
  let resolveFn: (v: any[] | string) => void;
  let rejectFn: (v: any) => void;
  const executer = new Executer(onSuccess, onError);

  // Inspect type of max, interval, taskCb
  if (
    typeof max !== "number" ||
    typeof interval !== "number" ||
    typeof taskCb !== "function"
  ) {
    throw new TypeError(
      "Except max, interval to be a number, taskCb to be a function"
    );
  }

  // Max should be equal or greater than 1, and interval should't less than 0
  if (max < 1 || interval < 0) {
    throw new Error("Except max min to 1, interval min to 0");
  }

  // Make max to an integer
  max = max >> 0;
  // Make recordError to boolean
  recordError = Boolean(recordError);
  /**
   * Add task to queue
   * @param tasks			 Task that need to handle
   * @param priority   Default to 0, the bigger priority of task, the more preferential to handle
   */
  function add(task: unknown, priority = 0) {
    if (task) {
      needSort = true;
      if (Array.isArray(task)) {
        task.forEach((t) => add(t, priority));
      } else {
        const taskNode = {
          handle: task,
          priority: typeof priority === "number" ? priority : 0,
        };
        currentQueue.push(taskNode);
      }
    }
  }

  // Run the queue
  function run() {
    if (currentState === "init") {
      currentPromise = new Promise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
        handleQueue();
      });
    }
  }

  // Sort queue and start to run tasks
  function handleQueue() {
    needSort && sortQueue();
    runTasks();
  }

  // Sort queue by the priority of every task
  function sortQueue() {
    currentQueue.sort((a, b) => b.priority - a.priority);
    needSort = false;
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
    if (recordError) {
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
    taskCb(result, resultIndex);

    if (currentState === "pause" || currentState === "init") {
      return;
    }

    if (hasFinishedCount === currentQueue.length) {
      setState("finish");
      resolveFn(finished);
    } else {
      next();
    }
  }

  async function next() {
    if (currentIndex < currentQueue.length - 1 && currentState === "running") {
      await wait(interval);
      if (
        currentIndex < currentQueue.length - 1 &&
        currentState === "running"
      ) {
        executer.handle(currentQueue[++currentIndex], currentIndex);
      }
    }
  }

  // Change state of queue
  function setState(nextState: State): void {
    currentState = nextState;
  }

  // TODO: Can add params to result, just start queue
  /**
   * @returns {Promise}
   */
  function result(): Promise<any> {
    if (currentPromise === null) {
      throw new Error("should add task and run the currentQueue");
    }
    return currentPromise;
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

  // Clear queue(can called when queue is error of state)
  // Make sure queue is not running
  function clear() {
    currentQueue = [];
    currentIndex = 0;
    finished = [];
    hasFinishedCount = 0;
    setState("init");
    currentPromise && resolveFn("CLEAR");
  }

  /**
   * @returns {State} get the state of queue
   */
  function getState(): State {
    return currentState;
  }

  const queue = {
    run,
    add,
    result,
    pause,
    resume,
    clear,
    getState,
  };

  return queue;
}

export type Queue = ReturnType<typeof createQueue>;

export { createQueue };
