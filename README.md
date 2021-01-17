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
import { createQueue } from "best-queue";
```

Require in Node:

```js
const { createQueue } = require("best-queue");
```

## **API**

| Attrubute/Method                 | Description                                                    | Type                                                 | Default                                                  |
| :------------------------------- | -------------------------------------------------------------- | :--------------------------------------------------- | -------------------------------------------------------- |
| createQueue                      | create a queue                                                 | (tasks: unkonwn[], options: Options) => Promise<any> |                                                          |
| options                          | create a queue by options                                      | Object                                               | {<br>max: 1, <br>interval: 0,<br>recordError: false<br>} |
| options.max                      | max concurrence task at the same time, default and min to 1    | Number                                               | 1                                                        |
| options.interval                 | the interval time between tow tasks(milliscond), default to 0  | Number                                               | 0                                                        |
| options.recordError              | record error task instead of reject queue when task gone error | Boolean                                              | false                                                    |
| pause()                          | `pause` the queue, queue stop to execute task                  | Function(): void                                     |
| resume()                         | rerun the queue                                                | Function(): void                                     |
| subscribe((taskStatus: 'success' | 'error', data: any, index: number, progress: number) => void)  | listener fired a task done                           | Function(): void                                         |

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

queue.subscribe((status, data, index) => {
  // queue will be paused after first task
  index === 0 && queue.pause();
});

setTimeout(() => {
  // queue paused after first task done, it will rerun the queue
  queue.resume();
}, 1500);
```

## Lisence

Copyright (c) 2020 Jacano Licensed under the MIT license.
