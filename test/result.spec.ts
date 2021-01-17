import { createQueue } from "../src/index";
import { genPromise } from "./utils";

describe("one concurrence task running result", () => {
  let queue;

  function initQueue() {
    queue = createQueue([genPromise(100)]);
  }

  beforeEach(() => {
    initQueue();
  });

  test("get one task result and finish state", () => {
    return queue.then((res) => {
      expect(res).toEqual([100]);
    });
  });
});

describe("one more concurrence tasks running result", () => {
  test("get two task result", () => {
    const queue = createQueue([genPromise(100), genPromise(200)], { max: 2 });
    return queue.then((res) => {
      expect(res).toEqual([100, 200]);
    });
  });

  test("can add array tasks and order in result", () => {
    const queue = createQueue(
      [genPromise(100), genPromise(300), genPromise(200)],
      { max: 2 }
    );
    return queue.then((res) => {
      expect(res).toEqual([100, 300, 200]);
    });
  });

  test("can add array tasks and order in result", () => {
    const queue = createQueue(
      [
        genPromise(100),
        genPromise(200),
        genPromise(300),
        genPromise(400),
        genPromise(500),
        genPromise(600),
        genPromise(700),
        genPromise(800),
        genPromise(900),
      ],
      { max: 2 }
    );
    return queue.then((res) => {
      expect(res).toEqual([100, 200, 300, 400, 500, 600, 700, 800, 900]);
    });
  });

  test("test final task finish", () => {
    const queue = createQueue(
      [genPromise(100), genPromise(100), genPromise(300), genPromise(200)],
      { max: 2 }
    );
    return queue.then((res) => {
      expect(res).toEqual([100, 100, 300, 200]);
    });
  });
});
