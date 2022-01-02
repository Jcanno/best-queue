function genPromise(time) {
  return function () {
    return new Promise<number>((r) => {
      setTimeout(() => {
        r(time)
      }, time)
    })
  }
}

function genRejectPromise(time) {
  return function () {
    return new Promise<number>((r, j) => {
      setTimeout(
        () => {
          j(time)
        },
        typeof time === 'number' ? time : 100,
      )
    })
  }
}

export type Expect<T extends true> = T

export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false

export { genRejectPromise, genPromise }
