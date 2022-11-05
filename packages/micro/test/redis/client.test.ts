import { MicroRedisClient, MicroRedisStartup } from "../../src/redis";
import { getTestOptions } from "./utils";

describe("client", () => {
  it("should send message and return boolean value", async () => {
    const options = getTestOptions("send_return");
    const startup = new MicroRedisStartup(options).use((ctx) => {
      ctx.res.setBody(ctx.req.body);
    });
    await startup.listen();

    const client = new MicroRedisClient(options);
    await client.connect();
    const result = await client.send("", true);

    await startup.close();
    await client.dispose();

    expect(result).toBe(true);
  });

  it("should send message and return undefined value", async () => {
    const options = getTestOptions("send_return_undefined");
    const startup = new MicroRedisStartup(options).use((ctx) => {
      ctx.res.setBody(ctx.req.body);
    });
    await startup.listen();

    const client = new MicroRedisClient(options);
    await client.connect();
    const result = await client.send("", undefined);
    await startup.close();
    await client.dispose();

    expect(result).toBeUndefined();
  });

  it("should emit message", async () => {
    const options = getTestOptions("emit");
    let invoke = false;
    const startup = new MicroRedisStartup(options).use(() => {
      invoke = true;
    });
    await startup.listen();

    const client = new MicroRedisClient(options);
    await client.connect();
    client.emit("", true);

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        await startup.close();
        await client.dispose();
        resolve();
      }, 1000);
    });
    expect(invoke).toBeTruthy();
  });

  it("should connect error with error host", async () => {
    const client = new MicroRedisClient({
      port: 443,
      host: "0.0.0.0",
    });

    let err = false;
    try {
      await client.connect();
      await client.send("", true);
    } catch {
      err = true;
    }
    await client.dispose();
    expect(err).toBeTruthy();
  });

  it("should listen with default port when port is undefined", async () => {
    const client = new MicroRedisClient({
      host: "127.0.0.2",
    });

    let error!: Error;
    try {
      await client.connect();
      await client.dispose();
    } catch (err) {
      error = err as Error;
    }
    expect(error["code"]).toBe("ECONNREFUSED");
  });

  it("should not send data when client redis is not connected", async () => {
    const client = new MicroRedisClient({});
    client.emit("", "");
  });
});
