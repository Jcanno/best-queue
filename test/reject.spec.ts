import { createQueue } from "../src/index";
import { genPromise, genRejectPromise } from "./utils";

describe("one concurrence task running reject", () => {
  test("reject", () => {
    const asyncTasks = [genPromise(100), genRejectPromise(200)];
    const queue = createQueue(asyncTasks);

    return expect(queue).rejects.toBe(200);
  });
});

describe("one more concurrence tasks running reject", () => {
  test("one reject task", async () => {
    const asyncTasks = [
      genPromise(100),
      genPromise(300),
      genRejectPromise(200),
    ];
    const queue = createQueue(asyncTasks, { max: 2 });
    try {
      await queue;
    } catch (err) {
      expect(err).toBe(200);
    }
  });

  test("one more reject tasks", async () => {
    const asyncTasks = [
      genPromise(100),
      genPromise(100),
      genRejectPromise(200),
      genRejectPromise(100),
    ];
    const queue = createQueue(asyncTasks, { max: 2 });

    try {
      await queue;
    } catch (err) {
      expect(err).toBe(100);
    }
  });
});

describe("skip error", () => {
  test("skip one last error", () => {
    const asyncTasks = [genPromise(100), genRejectPromise(200)];
    const queue = createQueue(asyncTasks, { max: 2, recordError: true });
    const err = new Error("200");

    return expect(queue).resolves.toEqual([100, err]);
  });

  test("skip not one last error", () => {
    const asyncTasks = [
      genPromise(100),
      genRejectPromise(200),
      genPromise(100),
    ];
    const queue = createQueue(asyncTasks, { max: 1, recordError: true });
    const err = new Error("200");

    return expect(queue).resolves.toEqual([100, err, 100]);
  });

  test("skip not err instance", () => {
    const err = new Error("200");
    const asyncTasks = [
      genPromise(100),
      genRejectPromise(err),
      genPromise(100),
    ];
    const queue = createQueue(asyncTasks, { max: 1, recordError: true });

    return expect(queue).resolves.toEqual([100, err, 100]);
  });

  test("skip error in 2 concurrence", () => {
    const err = new Error("200");
    const asyncTasks = [
      genPromise(100),
      genRejectPromise(err),
      genPromise(100),
    ];
    const queue = createQueue(asyncTasks, { max: 2, recordError: true });

    return expect(queue).resolves.toEqual([100, err, 100]);
  });
});
