import { MicroTcpClient } from "@ipare/micro-tcp-client";
import { TestMicroTcpStartup } from "../src/micro-tcp";

describe("micro tcp startup", () => {
  it("should send message and return boolean value", async () => {
    const startup = new TestMicroTcpStartup({
      port: 23334,
    }).use((ctx) => {
      ctx.res.setBody(ctx.req.body);
    });
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
    });
    await client.connect();
    const result = await client.send("", true);
    await startup.close();
    client.dispose();

    expect(result.data).toBe(true);
  });
});
