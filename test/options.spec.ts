import { createQueue } from "../src/index";

describe("params check", () => {
  test("empty array tasks", async () => {
    const queue = createQueue([]);
    queue.pause();
    await expect(queue).resolves.toEqual([]);
  });
});
