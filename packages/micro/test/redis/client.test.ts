import { MicroRedisClient, MicroRedisStartup } from "../../src/redis";
import { mockConnection, mockConnectionFrom } from "./utils";

describe("client", () => {
  it("should send message and return boolean value", async () => {
    const startup = new MicroRedisStartup()
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
        expect(ctx.bag("pt")).toBeTruthy();
      })
      .pattern("test_return", (ctx) => {
        ctx.bag("pt", true);
      });
    mockConnection.bind(startup)();
    await startup.listen();

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        resolve();
      }, 500);
    });

    const client = new MicroRedisClient();
    mockConnectionFrom.bind(client)(startup);
    await client.connect();

    const result = await client.send("test_return", true);

    await startup.close();
    await client.dispose();

    expect(result).toBe(true);
  });

  it("should send message and return undefined value", async () => {
    const startup = new MicroRedisStartup()
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
        expect(ctx.bag("pt")).toBeTruthy();
      })
      .pattern("test_undefined", (ctx) => {
        ctx.bag("pt", true);
      });
    mockConnection.bind(startup)();
    await startup.listen();

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        resolve();
      }, 500);
    });

    const client = new MicroRedisClient();
    mockConnectionFrom.bind(client)(startup);
    await client.connect();

    const result = await client.send("test_undefined", undefined);
    await startup.close();
    await client.dispose();

    expect(result).toBeUndefined();
  });

  it("should emit message", async () => {
    let invoke = false;
    const startup = new MicroRedisStartup()
      .use((ctx) => {
        invoke = true;
        expect(ctx.bag("pt")).toBeTruthy();
      })
      .pattern("test_emit", (ctx) => {
        ctx.bag("pt", true);
      });
    mockConnection.bind(startup)();

    await startup.listen();

    const client = new MicroRedisClient();
    mockConnectionFrom.bind(client)(startup);
    await client.connect();
    client.emit("test_emit", true);

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        await startup.close();
        await client.dispose();
        resolve();
      }, 500);
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
