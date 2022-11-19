import { MicroTcpClient } from "@ipare/micro-tcp-client";
import { TestMicroTcpStartup } from "../src/micro-tcp";

describe("micro tcp startup", () => {
  it("should send message and return boolean value", async () => {
    const startup = new TestMicroTcpStartup({
      port: 23334,
    })
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
      })
      .pattern("test_pattern", () => undefined);
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
    });
    await client.connect();
    const result = await client.send("test_pattern", true);
    await startup.close();
    await client.dispose();

    expect(result.data).toBe(true);
  });
});
