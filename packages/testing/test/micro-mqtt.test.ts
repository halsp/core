import { Context } from "@ipare/core";
import { TestMicroMqttStartup } from "../src/micro-mqtt";

describe("micro-mqtt", () => {
  it("should subscribe and publish", async () => {
    const startup = new TestMicroMqttStartup()
      .pattern("test_pattern", () => undefined)
      .use((ctx) => {
        ctx.res.body = "test";
      });
    const res = await startup["invoke"](new Context());
    expect(res.body).toBe("test");
  });
});
