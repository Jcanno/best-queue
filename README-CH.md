# **Best-Queue**

[English](https://github.com/Jcanno/best-queue)|简体中文

## 介绍
`best-queue`能让你用队列控制异步任务

![](https://hawksights.obs.cn-east-2.myhuaweicloud.com/ceshi/1593997266220.png)
## 安装
在命令函输入以下代码进行安装:

```js
npm i best-queue
```

## 用法
通过`ES6 模块`导入:
```js
import { createQueue } from 'best-queue';
```

`Node`环境下导入:
```js
const { createQueue } = require('best-queue');
```

## **API**
- createQueue(options):

  - **description**: 通过配置创建队列

  - **type**: `Function(Options): Queue`

  - options:

    - **描述**:  用于创建队列的配置项

    - **类型**: `Object`

    - **默认值**: `{max: 1, interval: 0, taskCb: function (){}}`

    - **用法**:

    ```js
    import { createQueue } from 'best-queue';

    let queue = createQueue({
      max: 1,
      interval: 1 * 1000,
      // 每个异步任务完成时的回调
      taskCb: result => {
        console.log('one task done')
      }
    })
    ```

  - options.max:

    - **描述**: 同时间最大并发量，默认且最小为1

    - **类型**: `Number`

    - **默认值**: `1`

  - options.interval:

    - **描述**:  每个异步任务之间的间隔(毫秒)，默认为0

    - **类型**: `Number`

    - **默认值**: `0`

  - options.taskCb:

    - **描述**:  每个异步任务完成时的回调

    - **类型**: `Function`

    - **默认值**: `function() {}`

  - options.recordError:

    - **描述**: 当任务出错时记录错误而不是结束队列，保持队列能够容错，队列的结果会保留所有错误和正常任务的结果。

    - **类型**: `Boolean`

    - **默认值**: `false`

- add(tasks, priority):

  - **描述**: 添加异步任务到队列中

  - **类型**: `tasks`: Function[]: Promise | Function: Promise, `priority`: Number

  - **用法**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // 每个异步任务完成时的回调
    taskCb: result => {
      console.log('one task done')
    }
  })

  // 添加异步任务, 优先级默认为0
  queue.add(asyncTask, 1)
  // 添加数组异步任务
  queue.add([
    asyncTask,
    asyncTask,
  ], 5)
  ```

- run() 

  - **描述**:  执行整个队列任务

  - **类型**: `Function`

  - **用法**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // 每个异步任务完成时的回调
    taskCb: result => {
      console.log('one task done')
    }
  })

  queue.add(asyncTask)
  queue.run()
  ```

- result()

  - **描述**: `result` 将返回一个`Promise` 并可以获取异步任务的结果

  - **类型**: `Function`

  - **用法**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // 每个异步任务完成时的回调
    taskCb: result => {
      console.log('one task done')
    }
  })

  // 添加异步任务
  queue.add(asyncTask)
  queue.run()
  queue.result().then(result => {
    console.log(result)
  })
  ```

- pause()

  - **描述**: 暂停队列, 此时的`result`方法会返回当前已完成任务的结果

  - **类型**: `Function`

  - **用法**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // 每个异步任务完成时的回调
    taskCb: result => {
      console.log('one task done')
      // 第一份任务完成后队列将暂停
      queue.pause()
    }
  })

  // 添加异步任务
  queue.add(asyncTask)
  // 添加数组异步任务
  queue.add([
    asyncTask,
    asyncTask,
  ])
  queue.run()
  queue.result().then(result => {
    // 队列暂停
    // 在这个例子中 result 为第一个异步任务的结果
    console.log(result)
  })
  ```

- resume()

  - **描述**: 继续执行队列，此时需要再次调用`result`方法来获取所有任务的结果

  - **类型**: `Function`

  - **用法**:

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // 每个异步任务完成时的回调
    taskCb: result => {
      console.log('one task done')
      // 第一份任务完成后队列将暂停
      queue.pause()
    }
  })

  // 添加异步任务
  queue.add(asyncTask)
  // 添加数组异步任务
  queue.add([
    asyncTask,
    asyncTask,
  ])
  queue.run()
  queue.result().then(result => {
    // 队列将继续执行
    queue.resume()
    queue.result().then(result => {
      console.log(result)
    })
  })
  ```

- clear()

  - **描述**: 清空队列，如果队列在执行时被调用，将会立刻结束执行并返回当前结果

  - **类型**: `Function`

- getState()

  - **描述**: 获取当前队列的状态: init, running, error, finish, pause

  - **类型**: `Function: String`

  - **用法**: 

  ```js
  let queue = createQueue({
    max: 1,
    interval: 1 * 1000,
    // 每个异步任务完成时的回调
    taskCb: result => {
      console.log('one task done')
      // 第一份任务完成后队列将暂停
      queue.pause()
    }
  })

  // 添加异步任务
  queue.add(asyncTask)
  // 添加数组异步任务
  queue.add([
    asyncTask,
    asyncTask,
  ])
  queue.run()
  queue.getState()  // running
  ```


## Lisence

Copyright (c) 2020 Jacano Licensed under the MIT license.

