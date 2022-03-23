import { Subscriber } from './subscriber'
import { Options, QueueResult } from './index'
import { wait } from './utils'
import { Queue } from './queue'

export enum State {
  'INIT',
  'RUNNING',
  'PAUSE',
  'FINISH',
  'ERROR',
}

const INITERRORDATA = Symbol()

export class Scheduler<R = unknown> {
  private hasFinishedCount = 0
  private currentTaskIndex = 0
  private resolveFn: (v: QueueResult<R>) => void = () => undefined
  private rejectFn: (e: unknown) => void = () => undefined
  private subscriber: Subscriber
  private options: Options
  private finished = []
  private errData = INITERRORDATA
  private taskQueue: Queue

  constructor(taskQueue: Queue, options: Options, subscriber: Subscriber) {
    this.taskQueue = taskQueue
    this.subscriber = subscriber
    this.options = options
  }

  // Get paused queue to resume
  // Should start next of currentIndex
  resume() {
    const isPaused = this.taskQueue.getState() === State.PAUSE
    const resumeWithNoNextTask = this.currentTaskIndex === this.taskQueue.count - 1

    if (isPaused) {
      if (resumeWithNoNextTask) {
        if (this.errData !== INITERRORDATA) {
          this.rejectFn(this.errData)
          this.taskQueue.setState(State.ERROR)
        } else {
          this.taskQueue.setState(State.FINISH)
          this.resolveFn(this.finished as QueueResult<R>)
        }

        return
      }
      this.taskQueue.setState(State.RUNNING)
      this.currentTaskIndex++
      this.run()
    }
  }

  // Pause the running queue
  pause() {
    this.taskQueue.getState() === State.RUNNING && this.taskQueue.setState(State.PAUSE)
  }

  private run() {
    const totalTasks = this.taskQueue.count
    const restTasks = totalTasks - this.currentTaskIndex
    const concurrency = this.options.max >= restTasks ? restTasks : this.options.max
    const startIndex = this.currentTaskIndex

    this.taskQueue.setState(State.RUNNING)

    for (let i = 0; i < concurrency; i++) {
      this.currentTaskIndex = startIndex + i
      this.handleTask(this.taskQueue.tasks[this.currentTaskIndex], this.currentTaskIndex)
    }
  }

  private async next() {
    const hasNextTask = () =>
      this.currentTaskIndex < this.taskQueue.count - 1 &&
      this.taskQueue.getState() === State.RUNNING

    if (hasNextTask()) {
      await wait(this.options.interval)
      hasNextTask() &&
        this.handleTask(this.taskQueue.tasks[++this.currentTaskIndex], this.currentTaskIndex)
    }
  }

  private handleSingleTaskResult(result: unknown, resultIndex: number) {
    this.hasFinishedCount++
    this.finished[resultIndex] = result
    const hasFinished = this.hasFinishedCount === this.taskQueue.count

    if ([State.PAUSE, State.INIT].includes(this.taskQueue.getState())) {
      return
    }

    if (hasFinished) {
      this.taskQueue.setState(State.FINISH)
      this.resolveFn(this.finished as QueueResult<R>)
    } else {
      this.next()
    }
  }

  private onSingleTaskSuccess(res: unknown, resultIndex: number) {
    this.handleSingleTaskResult(res, resultIndex)
  }

  private onSingleTaskError(err: unknown, resultIndex: number) {
    // when recordError is ture queue record error
    if (!!this.options.recordError) {
      this.handleSingleTaskResult(
        err instanceof Error ? err : new Error(err.toString()),
        resultIndex,
      )
    } else {
      // if queue is paused, store error data, reject queue when resume
      if (this.taskQueue.getState() === State.PAUSE) {
        this.errData = err as any
      } else {
        this.rejectFn(err)
        this.taskQueue.setState(State.ERROR)
      }
    }
  }

  promiseExecuter(resolve: (v: QueueResult<R>) => void, reject: (e: unknown) => void) {
    this.resolveFn = resolve
    this.rejectFn = reject

    // runTasks()
    this.run()
  }

  private getProgress(): number {
    return this.hasFinishedCount / this.taskQueue.count
  }

  private handleTask(task: unknown, resultIndex: number) {
    Promise.resolve(typeof task === 'function' ? task() : task)
      .then((res) => {
        this.onSingleTaskSuccess(res, resultIndex)
        this.subscriber.dispatch({
          taskStatus: 'success',
          data: res,
          taskIndex: resultIndex,
          progress: this.getProgress(),
        })
      })
      .catch((err) => {
        this.onSingleTaskError(err, resultIndex)
        this.subscriber.dispatch({
          taskStatus: 'error',
          data: err,
          taskIndex: resultIndex,
          progress: this.getProgress(),
        })
      })
  }
}
