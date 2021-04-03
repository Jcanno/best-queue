import { State, Options, Subscribe, Listener, Dispatch } from "./types"
import { wait } from "./utils/wait"
import Executer from "./executer"

function createQueue<R = unknown, E = unknown>(
  tasks: unknown[],
  options: Options = {}
): Promise<R[]> {
  const finished = []
  const currentQueue: unknown[] = Array.isArray(tasks) ? [...tasks] : [tasks]
  let { max = 1, interval = 0, recordError = false } = options
  let currentState: State = "init"
  let currentIndex = 0
  let hasFinishedCount = 0
  let resolveFn: (v: R[]) => void = () => undefined
  let rejectFn: (e: E) => void = () => undefined
  let currentListeners = []
  let nextListeners = currentListeners

  // Make max to an integer
  max = (max = max >> 0) < 1 ? 1 : max
  // Make interval to an integer
  interval = (interval = interval >> 0) < 0 ? 0 : interval

  function promiseExecuter(resolve: (v: R[]) => void, reject: (e: E) => void) {
    resolveFn = resolve
    rejectFn = reject

    runTasks()
  }

  // Called first run and resume cases
  function runTasks() {
    const totalTasks = currentQueue.length
    const restTasks = totalTasks - currentIndex
    const concurrency = max >= restTasks ? restTasks : max
    const startIndex = currentIndex

    setState("running")

    for (let i = 0; i < concurrency; i++) {
      currentIndex = startIndex + i
      executer.handle(currentQueue[currentIndex], currentIndex)
    }
  }

  function onSuccess(res: any, resultIndex: number) {
    handleSingleTaskResult(res, resultIndex)
  }

  function onError(err: any, resultIndex: number) {
    if (!!recordError) {
      handleSingleTaskResult(
        err instanceof Error ? err : new Error(err.toString()),
        resultIndex
      )
    } else {
      setState("error")
      rejectFn(err)
    }
  }

  function handleSingleTaskResult(result, resultIndex) {
    hasFinishedCount++
    finished[resultIndex] = result
    const hasFinished = hasFinishedCount === currentQueue.length

    if (currentState === "pause" || currentState === "init") {
      return
    }

    if (hasFinished) {
      setState("finish")
      resolveFn(finished)
    } else {
      next()
    }
  }

  async function next() {
    const hasNextTask = () =>
      currentIndex < currentQueue.length - 1 && currentState === "running"

    if (hasNextTask()) {
      await wait(interval)
      hasNextTask() &&
        executer.handle(currentQueue[++currentIndex], currentIndex)
    }
  }

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
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

  const dispatch: Dispatch = function dispatch(taskStatus, data, resultIndex) {
    const listeners = (currentListeners = nextListeners)

    listeners.forEach((listener) => {
      listener(
        taskStatus,
        data,
        resultIndex,
        hasFinishedCount / currentQueue.length
      )
    })
  }

  const executer = new Executer(dispatch)

  // Change state of queue
  function setState(nextState: State): void {
    currentState = nextState
  }

  // Pause the running queue
  function pause() {
    currentState === "running" && setState("pause")
  }

  // Get paused queue to resume
  // Should start next of currentIndex
  function resume() {
    const isPaused = currentState === "pause"
    const resumeWithNoNextTask = currentIndex === currentQueue.length - 1

    if (isPaused) {
      if (resumeWithNoNextTask) {
        setState("finish")
        resolveFn(finished)
        return
      }
      setState("running")
      currentIndex++
      runTasks()
    }
  }

  subscribe((taskStatus, data, index) => {
    taskStatus === "success" ? onSuccess(data, index) : onError(data, index)
  })

  const enhanceQueueApi = {
    pause,
    resume,
    subscribe,
  }

  // just resolve [] when queue is empty
  const emptyQueue = Array.isArray(tasks) && tasks.length === 0
  const queue = Object.assign(
    emptyQueue ? Promise.resolve([]) : new Promise<R[]>(promiseExecuter),
    enhanceQueueApi
  )

  return queue
}

export type Queue = ReturnType<typeof createQueue>

export { createQueue }
