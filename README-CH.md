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

| 属性/方法                     | 描述                                                 | 类型                                                 | 默认值                                                                            |
| :---------------------------- | ---------------------------------------------------- | :--------------------------------------------------- | --------------------------------------------------------------------------------- |
| createQueue                   | 创建一个队列                                         | (tasks: unkonwn[], options: Options) => Promise<any> |                                                                                   |
| options                       | 通过配置创建队列                                     | Object                                               | {<br>max: 1, <br>interval: 0,<br>taskCb: function (){}<br>recordError: false<br>} |
| options.max                   | 同时间最大并发量，默认且最小为 1                     | Number                                               | 1                                                                                 |
| options.interval              | 每个异步任务之间的间隔(毫秒)，默认为 0               | Number                                               | 0                                                                                 |
| options.taskCb                | 每个异步任务完成时的回调，只在队列运行时调用         | Function(result: any, index: number) {}              | function() {}                                                                     |
| options.recordError           | 当任务出错时记录错误而不是结束队列，保持队列能够容错 | Boolean                                              | false                                                                             |
| pause()                       | 暂停队列, 队列会停止执行任务                         | Function(): void                                     |
| resume()                      | 继续执行队列                                         | Function(): void                                     |
| subscribe(listener: Listener) | 每个子任务完成时会触发所有监听                       | Function((taskStatus: 'success'                      | 'error', data: any, index: number, progress: number) => void): void               |

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

const asyncTasks = [asyncTask, asyncTask];

/**
 * createQueue returns enhanced promise
 */
const queue = createQueue(asyncTasks, {
  max: 1,
  interval: 1 * 1000,
  recordError: false,
});

queue.then((result) => {
  console.log(result);
});

queue.subscribe((status, data, index) => {
  // 队列会在第一个任务后暂停
  index === 0 && queue.pause();
});

setTimeout(() => {
  // 队列在第一个任务后暂停，resume会继续执行队列
  queue.resume();
}, 1500);
```

## Lisence

Copyright (c) 2020 Jacano Licensed under the MIT license.
