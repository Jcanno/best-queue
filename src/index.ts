import { Scheduler } from './scheduler'
import { Subscriber, Listener } from './subscriber'

export interface Options {
  max?: number
  interval?: number
  recordError?: boolean
}
type PromiseReturn<R> = R extends () => infer P
  ? P extends Promise<infer Result>
    ? Result
    : P
  : R extends Promise<infer S>
  ? S
  : R

/**
 * Create Queue Result Type
 * number                          -> number[]
 * Promise<string>                 -> string[]
 * () => Promise<stirng>           -> string[]
 * [string, number]                -> [string, number]
 * [Promise<string>, number]       -> [string, number]
 * [() => Promise<stirng>, number] -> [string, number]
 */
export type QueueResult<R> = R extends [infer First, ...infer Rest]
  ? [PromiseReturn<First>, ...QueueResult<Rest>]
  : R extends []
  ? R
  : R extends Array<infer S>
  ? PromiseReturn<S>[]
  : R[]

interface EnhanceQueue<R> extends Promise<QueueResult<R>> {
  pause: () => void
  resume: () => void
  subscribe: (listener: Listener<QueueResult<R>>) => () => void
}

function createQueue<R = unknown>(tasks: unknown[], options: Options = {}): EnhanceQueue<R> {
  if (!Array.isArray(tasks)) {
    throw new TypeError('tasks must be a array')
  }

  let { max = 1, interval = 0, recordError = false } = typeof options === 'object' ? options : {}
  const subscriber = new Subscriber()
  const scheduler = new Scheduler<QueueResult<R>>(
    tasks,
    {
      max: (max = max >> 0) < 1 ? 1 : max,
      interval: (interval = interval >> 0) < 0 ? 0 : interval,
      recordError,
    },
    subscriber,
  )

  const enhanceQueueApi = {
    pause: scheduler.pause.bind(scheduler),
    resume: scheduler.resume.bind(scheduler),
    subscribe: subscriber.subscribe.bind(subscriber),
  }

  const queue = Object.assign(
    scheduler.isEmptyQueue()
      ? Promise.resolve([])
      : new Promise<any>((r, j) => scheduler.promiseExecuter(r, j)),
    enhanceQueueApi,
  )

  return queue
}

export { createQueue }
