import { TestMicroRedisStartup } from "../src/micro-redis";
import { Context } from "@halsp/core";

describe("micro-redis", () => {
  it("should subscribe and publish", async () => {
    const startup = new TestMicroRedisStartup()
      .pattern("test_pattern", () => undefined)
      .use((ctx) => {
        ctx.res.body = "test";
      });
    const res = await startup["invoke"](new Context());
    expect(res.body).toBe("test");
  });
});
