import { State } from './scheduler'

export class Queue {
  tasks: Record<number, unknown> = {}
  count = 0
  private state: State = State.Init

  enqueue(task: unknown) {
    this.tasks[this.count] = task
    this.count++
  }

  getState(): State {
    return this.state
  }

  // Change state of queue
  setState(nextState: State) {
    this.state = nextState
  }

  isEmptyQueue() {
    return this.count === 0
  }
}
