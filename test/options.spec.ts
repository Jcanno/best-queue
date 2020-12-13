import { createQueue } from "../src/index";

describe("type and value check", () => {
  test("can not call result with empty queue", () => {
    const queue = createQueue({
      max: 1,
    });

    expect(() => {
      queue.result();
    }).toThrowError("should add task and run the currentQueue");
  });
});
