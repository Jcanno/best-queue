import { Subscriber, Listener } from './subscriber'
import { Options, QueueResult } from './index'
import { wait } from './utils/wait'
import { Executer } from './executer'

enum State {
  'Init',
  'Running',
  'Pause',
  'Finish',
  'Error',
}

export class Scheduler<R = unknown> {
  private count = 0
  private hasFinishedCount = 0
  private currentTaskIndex = 0
  private state: State = State.Init
  private resolveFn: (v: QueueResult<R>) => void = () => undefined
  private rejectFn: (e: unknown) => void = () => undefined
  private tasks: Record<number, unknown> = {}
  private executer: Executer
  private subscriber: Subscriber
  private options: Options
  private finished = []

  constructor(tasks: unknown[], options: Options, executer: Executer, subscriber: Subscriber) {
    tasks.forEach((task) => this.enqueue(task))
    this.executer = executer
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
    const isPaused = this.state === State.Pause
    const resumeWithNoNextTask = this.currentTaskIndex === this.count - 1

    if (isPaused) {
      if (resumeWithNoNextTask) {
        this.setState(State.Finish)
        this.resolveFn(this.finished as QueueResult<R>)
        return
      }
      this.setState(State.Running)
      this.currentTaskIndex++
      this.run()
    }
  }

  // Pause the running queue
  pause() {
    this.state === State.Running && this.setState(State.Pause)
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
      this.executer.handle(this.tasks[this.currentTaskIndex], this.currentTaskIndex)
    }
  }

  private async next() {
    const hasNextTask = () =>
      this.currentTaskIndex < this.count - 1 && this.getState() === State.Running

    if (hasNextTask()) {
      await wait(this.options.interval)
      hasNextTask() &&
        this.executer.handle(this.tasks[++this.currentTaskIndex], this.currentTaskIndex)
    }
  }

  private handleSingleTaskResult(result: unknown, resultIndex: number) {
    this.hasFinishedCount++
    this.finished[resultIndex] = result
    const hasFinished = this.hasFinishedCount === this.count

    if (this.state === State.Pause || this.state === State.Init) {
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
      this.setState(State.Error)
      this.rejectFn(err)
    }
  }

  promiseExecuter(resolve: (v: QueueResult<R>) => void, reject: (e: unknown) => void) {
    this.resolveFn = resolve
    this.rejectFn = reject

    // runTasks()
    this.run()
  }

  subscribeBuildInListener() {
    const buildInListener: Listener<R> = ({ taskStatus, data, index }) => {
      taskStatus === 'success'
        ? this.onSingleTaskSuccess(data, index)
        : this.onSingleTaskError(data, index)
    }
    this.subscriber.subscribe(buildInListener)
  }

  isEmptyQueue() {
    return this.count === 0
  }
}
