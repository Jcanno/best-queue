# **Best-Queue**
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://www.npmjs.org/package/best-queue)
[![downloads](https://img.shields.io/npm/dm/best-queue)](https://www.npmjs.org/package/best-queue)
[![size](https://img.shields.io/bundlephobia/min/best-queue/3.0.0)](https://www.npmjs.org/package/best-queue)
[![issues](https://img.shields.io/github/issues-closed/Jcanno/best-queue)](https://www.npmjs.org/package/best-queue)
[![npm](https://img.shields.io/npm/v/best-queue)](https://www.npmjs.org/package/best-queue)

English|[简体中文](https://github.com/Jcanno/best-queue/blob/master/README-CH.md)

## Introduction

`best-queue` let you control tasks in a queue.

It's easy to execute task one by one with interval time in queue like this:

```js
Queue -> task -> wait(interval) -> task -> wait(interval) -> task -> finish
```

How about adding async task in queue:

```js
Queue -> Promise.resolve(task) -> wait(interval) -> Promise.resolve(task) -> wait(interval) -> Promise.resolve(task) -> finish
```

What if we want to execute two tasks at the same time to support concurrency in queue:

```js
Queue -> Promise.all([Promise.resolve(task), Promise.resolve(task)]) -> wait(interval) -> Promise.all([Promise.resolve(task), Promise.resolve(task)]) -> wait(interval) -> Promise.all([Promise.resolve(task), Promise.resolve(task)]) -> finish
```

But if one async task takes too much time because of network reason, the batch of task need to wait until the slow task resolve, we can do something make queue more efficient in theory.

That's `best-queue` do. See image below.

![](https://hawksights.obs.cn-east-2.myhuaweicloud.com/ceshi/1593997290864.png)

## Install

type in the command line to install with:

```js
npm i best-queue
```

## Usage

Import as an ES Module:

```js
import { createQueue } from "best-queue";
```

Require in Node:

```js
const { createQueue } = require("best-queue");
```

## **API**

| Attribute/Method                 | Description                                                    | Type                                                 | Default                                                  |
| :------------------------------- | -------------------------------------------------------------- | :--------------------------------------------------- | -------------------------------------------------------- |
| createQueue                      | create a queue                                                 | (tasks: unkonwn[], options: Options) => Promise<any> |                                                          |
| options                          | create a queue by options                                      | Object                                               | {<br>max: 1, <br>interval: 0,<br>recordError: false<br>} |
| options.max                      | max concurrence task at the same time, default and min to 1    | Number                                               | 1                                                        |
| options.interval                 | the interval time between tow tasks(milliscond), default to 0  | Number                                               | 0                                                        |
| options.recordError              | record error task instead of reject queue when task gone error | Boolean                                              | false                                                    |
| pause()                          | `pause` the queue, queue stop to execute task                  | Function(): void                                     |
| resume()                         | rerun the queue                                                | Function(): void                                     |
| subscribe(listener: Listener)  | listener fired a task done                           | Function(({taskStatus: 'success' \| 'error', data: unknown, taskIndex: number, progress: number}) => void): () => void                                         |

## Example

```js
import { createQueue } from "best-queue";

// simulate async task
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

const unsubscribe = queue.subscribe(({ taskIndex }) => {
  // queue will be paused after first task
  taskIndex === 0 && queue.pause();
});

setTimeout(() => {
  // queue paused after first task done, it will rerun the queue
  queue.resume();
}, 1500);
```

## Lisence

Copyright (c) 2020 Jacano Licensed under the MIT license.
