import { MicroTcpClient } from "@halsp/micro-tcp-client";
import { TestMicroTcpStartup } from "../src/micro-tcp";

describe("micro tcp startup", () => {
  it("should send message and return boolean value", async () => {
    const startup = new TestMicroTcpStartup({
      port: 23334,
    })
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
      })
      .register("test_pattern", () => undefined);
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
    });
    await client["connect"]();
    const result = await client.send("test_pattern", true);
    await client.dispose();
    await startup.close();

    expect(result).toBe(true);
  });
});
