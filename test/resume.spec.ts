import { createQueue } from '../src/index'
import { genPromise, genRejectPromise } from './utils'

describe('resume paused queue', () => {
  test('rerun the queue', () => {
    const queue = createQueue([genPromise(100), genPromise(200)])
    queue.subscribe(({ data }) => {
      if (data === 100) {
        queue.pause()
      }
    })
    setTimeout(() => {
      queue.resume()
    }, 300)
    function finalPromise() {
      return new Promise((resolve) => {
        queue.then((result) => {
          expect(result).toEqual([100, 200])
          resolve(null)
        })
      })
    }

    return finalPromise()
  })

  test('resume with no next task', () => {
    const queue = createQueue(
      [genPromise(100), genPromise(500), genPromise(100), genPromise(100)],
      { max: 4 },
    )
    queue.subscribe(({ taskIndex }) => {
      if (taskIndex === 0) {
        queue.pause()
      }
    })
    setTimeout(() => {
      queue.resume()
    }, 1000)
    function finalPromise() {
      return new Promise((resolve) => {
        queue.then((result) => {
          expect(result).toEqual([100, 500, 100, 100])
          resolve(null)
        })
      })
    }

    return finalPromise()
  })
})

describe('sd', () => {
  test('resume with no next task for error task', async () => {
    const queue = createQueue(
      [genPromise(100), genPromise(500), genRejectPromise(200), genPromise(100)],
      { max: 4 },
    )
    queue.subscribe(({ taskIndex }) => {
      if (taskIndex === 0) {
        queue.pause()
      }
    })
    setTimeout(() => {
      queue.resume()
    }, 1000)

    function finalPromise() {
      return new Promise((resolve) => {
        queue.catch((err) => {
          expect(err).toBe(200)
          resolve(null)
        })
      })
    }

    return finalPromise()
    // try {
    //   await queue
    // } catch (err) {
    //   expect(err).toBe(200)
    // }
  })
})
