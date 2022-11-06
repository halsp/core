import { MicroTcpClient, MicroTcpStartup } from "../src";

describe("client", () => {
  it("should send message and return boolean value", async () => {
    const startup = new MicroTcpStartup({
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

    expect(result).toBe(true);
  });

  it("should send message and return undefined value", async () => {
    const startup = new MicroTcpStartup({
      port: 23334,
    }).use((ctx) => {
      ctx.res.setBody(ctx.req.body);
    });
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
    });
    await client.connect();
    const result = await client.send("", undefined);
    await startup.close();
    client.dispose();

    expect(result).toBeUndefined();
  });

  it("should emit message", async () => {
    let invoke = false;
    const startup = new MicroTcpStartup({
      port: 23334,
    }).use(() => {
      invoke = true;
    });
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
    });
    await client.connect();
    client.emit("", true);

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        await startup.close();
        client.dispose();
        resolve();
      }, 1000);
    });
    expect(invoke).toBeTruthy();
  });

  it("should connect error with error host", async () => {
    const client = new MicroTcpClient({
      port: 443,
      host: "0.0.0.0",
    });
    await client.connect();

    let err = false;
    try {
      await client.send("", true);
    } catch {
      err = true;
    }
    client.dispose();
    expect(err).toBeTruthy();
  });

  it("should listen with default port when port is undefined", async () => {
    const client = new MicroTcpClient({
      host: "127.0.0.2",
    });
    await client.connect();
    client.dispose();
  });
});
