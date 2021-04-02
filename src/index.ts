import { Options, Subscribe, Listener, Dispatch } from "./types"
import Executer from "./executer"
import { TaskQueue } from "./queue"

function createQueue<R = unknown, E = unknown>(
  tasks: unknown[],
  options: Options = {}
) {
  const dispatch: Dispatch = function dispatch(taskStatus, data, resultIndex) {
    const listeners = (currentListeners = nextListeners)

    console.log(listeners)

    listeners.forEach((listener) => {
      listener(
        taskStatus,
        data,
        resultIndex,
        currentQueue.hasFinishedCount / currentQueue.count
      )
    })
  }

  const subscribe: Subscribe = function subscribe(listener: Listener) {
    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
      currentListeners = null
    }
  }
  const executer = new Executer(dispatch)

  let { max = 1, interval = 0, recordError = false } = options
  let currentListeners = []
  let nextListeners = currentListeners

  const currentQueue = new TaskQueue(tasks, executer, {
    max: (max = max >> 0) < 1 ? 1 : max,
    interval: (interval = interval >> 0) < 0 ? 0 : interval,
    recordError,
  })

  function promiseExecuter(resolve: (v: R[]) => void, reject: (e: E) => void) {
    currentQueue.resolveFn = resolve
    currentQueue.rejectFn = reject

    // runTasks()
    currentQueue.run()
  }

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  subscribe((taskStatus, data, index) => {
    taskStatus === "success"
      ? currentQueue.onSuccess(data, index)
      : currentQueue.onError(data, index)
  })

  const enhanceQueueApi = {
    pause: currentQueue.pause,
    resume: currentQueue.resume,
    subscribe,
  }

  // just resolve [] when tasks is empty
  const emptyQueue = currentQueue.count === 0
  const queue = Object.assign(
    emptyQueue ? Promise.resolve([]) : new Promise(promiseExecuter),
    enhanceQueueApi
  )

  return queue
}

export type Queue = ReturnType<typeof createQueue>

export { createQueue }
