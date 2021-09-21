import { createQueue } from '../src/index'

describe('params check', () => {
  test('empty array tasks', async () => {
    const queue = createQueue([])
    queue.pause()
    await expect(queue).resolves.toEqual([])
  })

  test('tasks must a array', async () => {
    function errorTasks() {
      createQueue('ss' as any)
    }
    await expect(errorTasks).toThrow('tasks must be a array')
  })
})
