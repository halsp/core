import { MicroNatsClient } from "@ipare/micro-nats-client";
import { MicroNatsStartup } from "../src";

describe("startup", () => {
  it("should subscribe and publish when use mock", async () => {
    const startup = new MicroNatsStartup({
      servers: "127.0.0.1:4222",
    }).pattern("test_pattern", (ctx) => {
      ctx.res.body = ctx.req.body;
    });
    await startup.listen();

    const client = new MicroNatsClient();
    await client["connect"]();
    const result = await client.send("test_pattern", "test_body");

    await client.dispose();
    await startup.close();

    expect(result.data).toBe("test_body");
    expect(result.error).toBeUndefined();
  });
});

describe("options", () => {
  it("should not connect with default options", async () => {
    const startup = new MicroNatsStartup();

    try {
      await startup.listen();
    } catch {}

    await startup.close();
  });
});
