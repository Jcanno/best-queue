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

| Attrubute           | Description                                                                    | Type                                    | Default                                                                           |
| :------------------ | ------------------------------------------------------------------------------ | :-------------------------------------- | --------------------------------------------------------------------------------- |
| options             | create a queue by options                                                      | Object                                  | {<br>max: 1, <br>interval: 0,<br>taskCb: function (){}<br>recordError: false<br>} |
| options.max         | max concurrence task at the same time, default and min to 1                    | Number                                  | 1                                                                                 |
| options.interval    | the interval time between tow tasks(milliscond), default to 0                  | Number                                  | 0                                                                                 |
| options.taskCb      | the callback when one task finished only called when state of queue is running | Function(result: any, index: number) {} | function() {}                                                                     |
| options.recordError | record error task instead of reject queue when task gone error                 | Boolean                                 | false                                                                             |

| Method     | Description                                                                                              | Type                                        |
| ---------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| add()      | add task to queue                                                                                        | Function(task: any, priority: number): void |
| run()      | `run` the queue                                                                                          | Function(): void                            |
| result()   | `result` return Promise with the result of all tasks                                                     | Function(): Promise<any>                    |
| pause()    | `pause` the queue, queue stop to execute task                                                            | Function(): void                            |
| resume()   | rerun the queue                                                                                          | Function(): void                            |
| clear()    | clear queue, it will resolve promise immediately if queue is running, you can get 'CLEAR' flag of result | Function(): void                            |
| getState() | get current state of queue: init, running, error, finish, pause                                          | Function(): State                           |

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

const queue = createQueue({
  max: 1,
  interval: 1 * 1000,
  // callback when every task done
  taskCb: (result, index) => {
    console.log("one task done");
    // queue will be paused after first task
    queue.pause();
  },
  recordError: false,
});

// add task, priority default to 0
queue.add(asyncTask, 1);
// add array task
queue.add(
  [
    // asyncTask can be a function return promise
    asyncTask,
    asyncTask,
  ],
  5
);
// task can be any type data
queue.add(5, 10);
queue.run();
queue.result().then((result) => {
  console.log(result);

  if (result === "CLEAR") {
    // do something
  }
});

setTimeout(() => {
  // queue paused after first task done, it will rerun the queue
  queue.resume();
  // then clear queue, resolve queue with `CLEAR` result
  queue.clear();
}, 1500);
```

## Lisence

Copyright (c) 2020 Jacano Licensed under the MIT license.
