type ListenerOptions<D = unknown> = {
  taskStatus: 'success' | 'error'
  data: D extends ArrayLike<any> ? D[number] : unknown
  taskIndex: number
  progress: number
}

export type Listener<R = unknown> = (listenerOptions: Partial<ListenerOptions<R>>) => void

export type Dispatch = (listenerOptions: ListenerOptions) => void

/**
 * queue Subscriber
 */
export class Subscriber {
  private currentListeners: Listener[] = []
  private nextListeners: Listener[] = []

  dispatch(listenerOptions: ListenerOptions) {
    const listeners = (this.currentListeners = this.nextListeners)

    listeners.forEach((listener) => {
      listener(listenerOptions)
    })
  }

  /**
   * subscribe a listener
   * @param listener listener to add
   * @returns        unsubscribe
   */
  subscribe(listener: Listener): () => void {
    if (typeof listener !== 'function') {
      throw new Error('listener must be a function')
    }
    this.ensureCanMutateNextListeners()
    this.nextListeners.push(listener)

    const unsubscribe = function unsubscribe() {
      this.ensureCanMutateNextListeners()
      const index = this.nextListeners.indexOf(listener)
      this.nextListeners.splice(index, 1)
      this.currentListeners = null
    }.bind(this)

    return unsubscribe
  }

  /**
   * ensure add listener safety avoid loop call subscribe
   */
  private ensureCanMutateNextListeners() {
    if (this.nextListeners === this.currentListeners) {
      this.nextListeners = this.currentListeners.slice()
    }
  }
}
