import { Context } from "@ipare/core";
import { TestMicroNatsStartup } from "../src/micro-nats";

describe("micro-nats", () => {
  it("should subscribe and publish", async () => {
    const startup = new TestMicroNatsStartup()
      .pattern("test_pattern", () => undefined)
      .use((ctx) => {
        ctx.res.body = "test";
      });
    const res = await startup["invoke"](new Context());
    expect(res.body).toBe("test");
  });
});
