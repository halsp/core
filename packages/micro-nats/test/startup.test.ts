import { Startup } from "@halsp/core";
import { MicroNatsClient } from "../src";
import "../src/server";

describe("startup", () => {
  it("should subscribe and publish when use mock", async () => {
    const startup = new Startup()
      .useMicroNats({
        servers: "127.0.0.1:6001",
      })
      .useMicroNats()
      .register("test_pattern", (ctx) => {
        ctx.res.body = ctx.req.body;
      });
    await startup.listen();

    const client = new MicroNatsClient({
      servers: "127.0.0.1:6001",
    });
    await client["connect"]();
    const result = await client.send("test_pattern", "test_body");

    await client.dispose();
    await startup.close();

    expect(result).toBe("test_body");
  });
});

describe("options", () => {
  it("should not connect with default options", async () => {
    const startup = new Startup().useMicroNats();

    try {
      await startup.listen();
    } catch {}

    await startup.close();
  });
});
