import { State, IExecuter, Options } from "./types"
import { wait } from "./utils/wait"

export class TaskQueue<R = unknown> {
  count: number = 0
  index: number = 0
  state: State = "init"
  resolveFn: (v: R[]) => void = () => undefined
  rejectFn: (e: unknown) => void = () => undefined
  hasFinishedCount: number = 0
  private tasks: Record<number, unknown> = {}
  private executer: IExecuter
  private options: Options
  private finished = []

  constructor(tasks: unknown[], executer: IExecuter, options: Options) {
    tasks.forEach((task) => this.enqueue(task))
    this.executer = executer
    this.options = options
  }

  enqueue(task: unknown) {
    this.tasks[this.count] = task
    this.count++
  }

  private getState() {
    return this.state
  }

  // Get paused queue to resume
  // Should start next of currentIndex
  resume() {
    const isPaused = this.state === "pause"
    const resumeWithNoNextTask = this.index === this.count - 1

    if (isPaused) {
      if (resumeWithNoNextTask) {
        this.setState("finish")
        this.resolveFn(this.finished)
        return
      }
      this.setState("running")
      this.index++
      this.run()
    }
  }

  // Pause the running queue
  pause() {
    this.state === "running" && this.setState("pause")
  }

  // Change state of queue
  private setState(nextState: State) {
    this.state = nextState
  }

  run() {
    const totalTasks = this.count
    const restTasks = totalTasks - this.index
    const concurrency =
      this.options.max >= restTasks ? restTasks : this.options.max
    const startIndex = this.index

    this.setState("running")

    for (let i = 0; i < concurrency; i++) {
      this.index = startIndex + i
      this.executer.handle(this.tasks[this.index], this.index)
    }
  }

  private async next() {
    const hasNextTask = () =>
      this.index < this.count - 1 && this.getState() === "running"

    if (hasNextTask()) {
      await wait(this.options.interval)
      hasNextTask() &&
        this.executer.handle(this.tasks[++this.index], this.index)
    }
  }

  private handleSingleTaskResult(result, resultIndex) {
    this.hasFinishedCount++
    this.finished[resultIndex] = result
    const hasFinished = this.hasFinishedCount === this.count

    if (this.state === "pause" || this.state === "init") {
      return
    }

    if (hasFinished) {
      this.setState("finish")
      this.resolveFn(this.finished)
    } else {
      this.next()
    }
  }

  onSuccess(res: any, resultIndex: number) {
    this.handleSingleTaskResult(res, resultIndex)
  }

  onError(err: any, resultIndex: number) {
    if (!!this.options.recordError) {
      this.handleSingleTaskResult(
        err instanceof Error ? err : new Error(err.toString()),
        resultIndex
      )
    } else {
      this.setState("error")
      this.rejectFn(err)
    }
  }
}
