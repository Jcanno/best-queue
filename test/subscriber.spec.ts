import { createQueue } from '../src/index'
import { genPromise } from './utils'

describe('subscribe', () => {
  test('listener must be a function', () => {
    const queue = createQueue([genPromise(100)])
    function subscribe() {
      queue.subscribe('23' as any)
    }

    expect(subscribe).toThrow('listener must be a function')
  })
})

describe('unsubscribe', () => {
  test('unsubscribe for 2 times called', () => {
    const queue = createQueue([genPromise(100), genPromise(200), genPromise(300)])
    const mock = jest.fn()
    const unsubscribe = queue.subscribe(({ taskIndex }) => {
      mock()
      if (taskIndex === 1) {
        unsubscribe()
      }
    })

    return queue.then(() => {
      expect(mock).toBeCalledTimes(2)
    })
  })

  test('unsubscribe for 1 time called', () => {
    const queue = createQueue([genPromise(100), genPromise(200), genPromise(300)])
    const mock = jest.fn()
    const unsubscribe = queue.subscribe(({ taskIndex }) => {
      mock()
      if (taskIndex === 0) {
        unsubscribe()
      }
    })

    return queue.then(() => {
      expect(mock).toBeCalledTimes(1)
    })
  })
})
