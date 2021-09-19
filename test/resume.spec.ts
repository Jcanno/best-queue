import { createQueue } from '../src/index'
import { genPromise } from './utils'

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
})
