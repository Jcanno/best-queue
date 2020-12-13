# **Best-Queue**

[English](https://github.com/Jcanno/best-queue)|简体中文

## 介绍

`best-queue`能让你用队列控制异步任务

![](https://hawksights.obs.cn-east-2.myhuaweicloud.com/ceshi/1593997266220.png)

## 安装

在命令行输入以下代码进行安装:

```js
npm i best-queue
```

## 用法

通过`ES6 模块`导入:

```js
import { createQueue } from "best-queue";
```

`Node`环境下导入:

```js
const { createQueue } = require("best-queue");
```

## **API**

| 属性                | 描述                                                 | 类型                                    | 默认值                                                                            |
| :------------------ | ---------------------------------------------------- | :-------------------------------------- | --------------------------------------------------------------------------------- |
| options             | 通过配置创建队列                                     | Object                                  | {<br>max: 1, <br>interval: 0,<br>taskCb: function (){}<br>recordError: false<br>} |
| options.max         | 同时间最大并发量，默认且最小为 1                     | Number                                  | 1                                                                                 |
| options.interval    | 每个异步任务之间的间隔(毫秒)，默认为 0               | Number                                  | 0                                                                                 |
| options.taskCb      | 每个异步任务完成时的回调，只在队列运行时调用         | Function(result: any, index: number) {} | function() {}                                                                     |
| options.recordError | 当任务出错时记录错误而不是结束队列，保持队列能够容错 | Boolean                                 | false                                                                             |

| 方法       | 描述                                                    | 类型                                        |
| ---------- | ------------------------------------------------------- | ------------------------------------------- |
| add()      | 添加异步任务到队列中                                    | Function(task: any, priority: number): void |
| run()      | 执行整个队列任务                                        | Function(): void                            |
| result()   | `result` 将返回一个`Promise` 并可以获取异步任务的结果   | Function(): Promise<any>                    |
| pause()    | 暂停队列, 队列会停止执行任务                            | Function(): void                            |
| resume()   | 继续执行队列                                            | Function(): void                            |
| clear()    | 清空队列，将会立刻结束执行并返回`CLEAR`的结果           | Function(): void                            |
| getState() | 获取当前队列的状态: init, running, error, finish, pause | Function(): State                           |

## 例子

```js
import { createQueue } from "best-queue";

// 模拟异步任务
function asyncTask() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

const queue = createQueue({
  max: 1,
  interval: 1 * 1000,
  // 每个异步任务完成时的回调
  taskCb: (result, index) => {
    console.log("one task done");
    // queue will be paused after first task
    queue.pause();
  },
  recordError: false,
});

// 添加异步任务，优先级默认为0
queue.add(asyncTask, 1);
// 添加异步任务
queue.add(
  [
    // 异步任务可以是返回Promise的函数
    asyncTask,
    asyncTask,
  ],
  5
);
// 任务可以为任何类型
queue.add(5, 10);
queue.run();
queue.result().then((result) => {
  console.log(result);

  if (result === "CLEAR") {
    // 做什么...
  }
});

setTimeout(() => {
  // 队列在第一个任务后暂停，resume会继续执行队列
  queue.resume();
  // 清空队列，此时会返回`CLEAR`结果
  queue.clear();
}, 1500);
```

## Lisence

Copyright (c) 2020 Jacano Licensed under the MIT license.
