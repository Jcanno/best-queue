<h1 align="center"><img height="300" with="700" src="https://raw.githubusercontent.com/Jcanno/images/master/best-queue/logo.png" /><br> </h1>

<h4 align="center">

[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://www.npmjs.org/package/best-queue)
[![downloads](https://img.shields.io/npm/dt/best-queue)](https://www.npmjs.org/package/best-queue)
[![size](https://img.shields.io/bundlephobia/min/best-queue/3.0.0)](https://www.npmjs.org/package/best-queue)
[![issues](https://img.shields.io/github/issues-closed/Jcanno/best-queue)](https://www.npmjs.org/package/best-queue)
[![npm](https://img.shields.io/npm/v/best-queue)](https://www.npmjs.org/package/best-queue)

</h4>

<h4 align="center">

[English](https://github.com/Jcanno/best-queue)|简体中文
</h4>

## 介绍

`best-queue`能让你用队列控制异步任务

让任务在队列中一个接一个执行:

```js
Queue -> task -> wait(interval) -> task -> wait(interval) -> task -> finish
```

在队列中加入异步任务:

```js
Queue -> Promise.resolve(task) -> wait(interval) -> Promise.resolve(task) -> wait(interval) -> Promise.resolve(task) -> finish
```

让队列同时执行两个任务支持并发:

```js
Queue -> Promise.all([Promise.resolve(task), Promise.resolve(task)]) -> wait(interval) -> Promise.all([Promise.resolve(task), Promise.resolve(task)]) -> wait(interval) -> Promise.all([Promise.resolve(task), Promise.resolve(task)]) -> finish
```

但如果某个异步任务由于网络原因花费太多的时间，这一批的任务需要等待这个任务完成，理论上我们可以让队列执行上更加高效

如下图:

![](https://raw.githubusercontent.com/Jcanno/images/master/best-queue/queue-cn.png)

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

通过JS脚本引入(暴露`BQueue`作为全局变量):

```js
<script src="https://cdn.jsdelivr.net/npm/best-queue"></script>
<script src="https://unpkg.com/best-queue"></script>
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
| subscribe(listener: Listener) | 每个子任务完成时会触发所有监听                       | Function((taskStatus: 'success' \| 'error', data: unknown, taskIndex: number, progress: number) => void): () => void               |

## 例子

```js
import { createQueue } from "best-queue";

// 模拟异步任务
function asyncTask() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, 1000);
  });
}

const asyncTasks = [asyncTask, asyncTask];

/**
 * createQueue 返回增强版的promise
 */
const queue = createQueue(asyncTasks, {
  max: 1,
  interval: 1 * 1000,
  recordError: false,
});

queue.then((result) => {
  console.log(result);
});

const unsubscribe = queue.subscribe(({ taskIndex }) => {
  // 队列会在第一个任务后暂停
  taskIndex === 0 && queue.pause();
});

setTimeout(() => {
  // 队列在第一个任务后暂停，resume会继续执行队列
  queue.resume();
}, 1500);
```

## Lisence

Copyright (c) 2020 Jacano Licensed under the MIT license.
