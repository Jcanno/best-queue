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

    - **default**: `{max: 1, interval: 0, taskCb: function (){}, recordError: false}`

    - **usage**:

    ```js
    import { createQueue } from 'best-queue';

    let queue = createQueue({
      max: 1,
      interval: 1 * 1000,
      // callback when every task done
      taskCb: (result, index) => {
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

  - options.recordError:

    - **description**: record error task instead of reject queue when task gone error, make queue can tolerate error, result of queue contains all result of error or normal task.

    - **type**: `Boolean`

    - **default**: `false`

- add(tasks, priority):

  - **description**: add task to queue

  - **type**: `tasks`: Function[]: Promise | Function: Promise, `priority`: Number

  - **usage**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // callback when every task done
    taskCb: (result, index) => {
      console.log('one task done')
    }
  })

  // add task, priority default to 0
  queue.add(asyncTask, 1)
  // add array task
  queue.add([
    // asyncTask expected to be function return promise
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
    taskCb: (result, index) => {
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
    taskCb: (result, index) => {
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

  - **description**:  `pause` the queue, queue stop to execute task.

  - **type**: `Function`

  - **usage**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // callback when every task done
    taskCb: (result, index) => {
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
  // result will waiting here
  queue.result().then(result => {
    console.log(result)
  })
  ```

- resume()

  - **description**: rerun the queue.

  - **type**: `Function`

  - **usage**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // callback when every task done
    taskCb: (result, index) => {
      console.log('one task done')
      // queue will be paused after first task
      if(index === 0) {
        queue.pause()
      }
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
    console.log(result)
  })
  
  setTimeout(() => {
    // queue paused after first task done, it will rerun the queue
    queue.resume();
  }, 1500);
  ```

- clear()

  - **description**: clear queue, it will resolve promise immediately if queue is running, you can get 'CLEAR' flag of result

  - **type**: `Function`

  - **usage**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // callback when every task done
    taskCb: (result, index) => {
      console.log('one task done')
      // queue will be paused after first task
      if(index === 0) {
        queue.pause()
      }
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
    if(result === 'CLEAR') {
      // do something
    }
  })
  
  setTimeout(() => {
    // clear queue, resovle queue with `CLEAR` result
    queue.clear();
  }, 1500);
  ```

- getState()

  - **描述**: get current state of queue: init, running, error, finish, pause

  - **类型**: `Function: String`

  - **用法**: 

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // callback when every task done
    taskCb: (result, index) => {
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
