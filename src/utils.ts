/**
 * @param time time in two tasks
 */
export function wait(time: number): Promise<null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, time)
  })
}

export function isObject(target: any) {
  return typeof target === 'object' && target !== null
}
