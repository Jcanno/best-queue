import { IExecuter, TaskNode } from "./types";

/**
 * Execute single task, when a task done, put the result of task into finished
 * run taskCb of options(taskCb may pause the queue, it's just decided by user),
 * so after that if state of queue is Paused, queue stop execute task,
 * if not and queue is over, change state and resolve currentPromise,
 * if queue is not over, check currentIndex and currentState,
 * after waiting the inverval, check currentIndex and currentState again(we don't
 * know if the queue is over ater wait), then find next task by currentIndex, execute
 * next task in a loop
 *
 * @param task Current running task
 * @param resultIndex Make the order of finished be same to the order of queue
 */
class Executer implements IExecuter {
  onSuccess: (result: any, resultIndex: number) => void;
  onError: (error: any, resultIndex: number) => void;

  constructor(onSuccess, onError) {
    this.onSuccess = onSuccess;
    this.onError = onError;
  }

  handle(taskNode: TaskNode, resultIndex: number) {
    const taskHandle = taskNode.handle;

    Promise.resolve(
      typeof taskHandle === "function" ? taskHandle() : taskHandle
    )
      .then((res) => {
        this.onSuccess(res, resultIndex);
      })
      .catch((err) => {
        this.onError(err, resultIndex);
      });
  }
}

export default Executer;
