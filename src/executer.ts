import { IExecuter, Dispatch } from "./types"

/**
 * @param task Current running task
 * @param resultIndex Make the order of finished be same to the order of queue
 */
class Executer implements IExecuter {
  dispatch: Dispatch

  constructor(dispatch) {
    this.dispatch = dispatch
  }

  handle(task: unknown, resultIndex: number) {
    Promise.resolve(typeof task === "function" ? task() : task)
      .then((res) => {
        this.dispatch("success", res, resultIndex)
      })
      .catch((err) => {
        this.dispatch("error", err, resultIndex)
      })
  }
}

export default Executer
