import { Subscriber } from './subscriber'

/**
 * @param task Current running task
 * @param resultIndex Make the order of finished be same to the order of queue
 */
export class Executer {
  private subscriber: Subscriber

  constructor(subscriber: Subscriber) {
    this.subscriber = subscriber
  }

  handle(task: unknown, resultIndex: number) {
    Promise.resolve(typeof task === 'function' ? task() : task)
      .then((res) => {
        this.subscriber.dispatch({
          taskStatus: 'success',
          data: res,
          index: resultIndex,
          progress: 0,
        })
      })
      .catch((err) => {
        this.subscriber.dispatch({
          taskStatus: 'error',
          data: err,
          index: resultIndex,
          progress: 0,
        })
      })
  }
}

export default Executer
