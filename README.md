# **Best-Queue**

English|[简体中文](https://github.com/Jcanno/best-queue/blob/master/README-CH.md)

## Introduction

`best-queue` let you control async tasks in a queue.

![](https://hawksights.obs.cn-east-2.myhuaweicloud.com/ceshi/1593997290864.png)
## Install
type in the command line to install with:

```js
npm i best-queue
```

## Usage
Import as an ES Module:
```js
import { createQueue } from 'best-queue';
```

Require in Node:
```js
const { createQueue } = require('best-queue');
```

## **API**

- createQueue(options):

  - **description**: create a queue by options

  - **type**: `Function(Options): Queue`

  - options:

    - **description**:  option to create queue

    - **type**: `Object`

    - **default**: `{max: 1, interval: 0, taskCb: function (){}}`

    - **usage**:

    ```js
    import { createQueue } from 'best-queue';

    let queue = createQueue({
      max: 1,
      interval: 1 * 1000,
      // callback when every task done
      taskCb: result => {
        console.log('one task done')
      }
    })
    ```

  - options.max:

    - **description**: max concurrence task at the same time, default and min to 1

    - **type**: `Number`

    - **default**: `1`

  - options.interval:

    - **description**: the interval time between tow tasks(milliscond), default to 0

    - **type**: `Number`

    - **default**: `0`

  - options.taskCb:

    - **description**: the callback when one task finished

    - **type**: `Function`

    - **default**: `function() {}`

- add(tasks, priority):

  - **description**: add task to queue

  - **type**: `tasks`: Function[]: Promise | Function: Promise, `priority`: Number

  - **usage**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // callback when every task done
    taskCb: result => {
      console.log('one task done')
    }
  })

  // add task, priority default to 0
  queue.add(asyncTask, 1)
  // add array task
  queue.add([
    asyncTask,
    asyncTask,
  ], 5)
  ```

- run() 

  - **description**:  `run` the queue

  - **type**: `Function`

  - **usage**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // callback when every task done
    taskCb: result => {
      console.log('one task done')
    }
  })

  queue.add(asyncTask)
  queue.run()
  ```

- result()

  - **description**:  `result` return Promise with the result of all tasks.

  - **type**: `Function: Promise`

  - **usage**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // callback when every task done
    taskCb: result => {
      console.log('one task done')
    }
  })

  // add task
  queue.add(asyncTask)
  queue.run()
  queue.result().then(result => {
    console.log(result)
  })
  ```

- pause()

  - **description**:  `pause` the queue, `result` method will return the result of finished tasks.

  - **type**: `Function`

  - **usage**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // callback when every task done
    taskCb: result => {
      console.log('one task done')
      // queue will be paused after first task
      queue.pause()
    }
  })

  // add task
  queue.add(asyncTask)
  // add array task
  queue.add([
    asyncTask,
    asyncTask,
  ])
  queue.run()
  queue.result().then(result => {
    // the queue paused
    // return the result of first task in this case
    console.log(result)
  })
  ```

- resume()

  - **description**: rerun the queue, you need to call the `result` method again to get the result of all tasks.

  - **type**: `Function`

  - **usage**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // callback when every task done
    taskCb: result => {
      console.log('one task done')
      // queue will be paused after first task
      queue.pause()
    }
  })

  // add task
  queue.add(asyncTask)
  // add array task
  queue.add([
    asyncTask,
    asyncTask,
  ])
  queue.run()
  queue.result().then(result => {
    // queue will rerun
    queue.resume()
    queue.result().then(result => {
      console.log(result)
    })
  })
  ```

- clear()

  - **description**: clear queue, it will resolve promise immediately if queue is running

  - **type**: `Function`

- getState()

  - **描述**: get current state of queue: init, running, error, finish, pause

  - **类型**: `Function: String`

  - **用法**: 

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // callback when every task done
    taskCb: result => {
      console.log('one task done')
      // queue will be paused after first task
      queue.pause()
    }
  })

  // add task
  queue.add(asyncTask)
  // add array task
  queue.add([
    asyncTask,
    asyncTask,
  ])
  queue.run()
  queue.getState()  // running
  ```

## Lisence

Copyright (c) 2020 Jacano Licensed under the MIT license.
