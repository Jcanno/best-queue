export type State = "init" | "running" | "pause" | "finish" | "error"

export interface Options {
  max?: number
  interval?: number
  recordError?: boolean
}

export interface IExecuter {
  handle(task: unknown, resultIndex: number): void
}

export type Listener = (
  taskStatus: "success" | "error",
  data: any,
  index: number,
  progress: number
) => void

export type Dispatch = (
  taskStatus: "success" | "error",
  data: any,
  index: number
) => void

export type Subscribe = (listener: Listener) => void
