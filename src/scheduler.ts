import { Subscriber } from './subscriber'
import { Options, QueueResult } from './index'
import { wait } from './utils/wait'

enum State {
  'Init',
  'Running',
  'Pause',
  'Finish',
  'Error',
}

const InitErrorData = Symbol()

export class Scheduler<R = unknown> {
  private count = 0
  private hasFinishedCount = 0
  private currentTaskIndex = 0
  private state: State = State.Init
  private resolveFn: (v: QueueResult<R>) => void = () => undefined
  private rejectFn: (e: unknown) => void = () => undefined
  private tasks: Record<number, unknown> = {}
  private subscriber: Subscriber
  private options: Options
  private finished = []
  private errData = InitErrorData

  constructor(tasks: unknown[], options: Options, subscriber: Subscriber) {
    tasks.forEach((task) => this.enqueue(task))
    this.subscriber = subscriber
    this.options = options
  }

  private enqueue(task: unknown) {
    this.tasks[this.count] = task
    this.count++
  }

  private getState(): State {
    return this.state
  }

  // Get paused queue to resume
  // Should start next of currentIndex
  resume() {
    const isPaused = this.getState() === State.Pause
    const resumeWithNoNextTask = this.currentTaskIndex === this.count - 1

    if (isPaused) {
      if (resumeWithNoNextTask) {
        if (this.errData !== InitErrorData) {
          this.rejectFn(this.errData)
          this.setState(State.Error)
        } else {
          this.setState(State.Finish)
          this.resolveFn(this.finished as QueueResult<R>)
        }

        return
      }
      this.setState(State.Running)
      this.currentTaskIndex++
      this.run()
    }
  }

  // Pause the running queue
  pause() {
    this.getState() === State.Running && this.setState(State.Pause)
  }

  // Change state of queue
  private setState(nextState: State) {
    this.state = nextState
  }

  private run() {
    const totalTasks = this.count
    const restTasks = totalTasks - this.currentTaskIndex
    const concurrency = this.options.max >= restTasks ? restTasks : this.options.max
    const startIndex = this.currentTaskIndex

    this.setState(State.Running)

    for (let i = 0; i < concurrency; i++) {
      this.currentTaskIndex = startIndex + i
      this.handleTask(this.tasks[this.currentTaskIndex], this.currentTaskIndex)
    }
  }

  private async next() {
    const hasNextTask = () =>
      this.currentTaskIndex < this.count - 1 && this.getState() === State.Running

    if (hasNextTask()) {
      await wait(this.options.interval)
      hasNextTask() && this.handleTask(this.tasks[++this.currentTaskIndex], this.currentTaskIndex)
    }
  }

  private handleSingleTaskResult(result: unknown, resultIndex: number) {
    this.hasFinishedCount++
    this.finished[resultIndex] = result
    const hasFinished = this.hasFinishedCount === this.count

    if ([State.Pause, State.Init].includes(this.getState())) {
      return
    }

    if (hasFinished) {
      this.setState(State.Finish)
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
      if (this.getState() === State.Pause) {
        this.errData = err as any
      } else {
        this.rejectFn(err)
        this.setState(State.Error)
      }
    }
  }

  promiseExecuter(resolve: (v: QueueResult<R>) => void, reject: (e: unknown) => void) {
    this.resolveFn = resolve
    this.rejectFn = reject

    // runTasks()
    this.run()
  }

  isEmptyQueue() {
    return this.count === 0
  }

  private getProgress(): number {
    return this.hasFinishedCount / this.count
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
