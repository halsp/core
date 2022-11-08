import { MicroRedisClient, MicroRedisConnection } from "../src";
import { localOptions, localTest, runEmitTest, runSendTest } from "./utils";

describe("client", () => {
  it("should send message and return boolean value", async () => {
    const result = await runSendTest(
      true,
      (ctx) => {
        ctx.res.setBody(ctx.req.body);
      },
      {
        host: "localhost",
        port: 6379,
      },
      undefined,
      true
    );
    expect(result.data).toBe(true);
  });

  it("should send message and return value with prefix", async () => {
    const result = await runSendTest(
      {
        a: 1,
        b: 2,
      },
      (ctx) => {
        ctx.res.setBody(ctx.req.body);
      },
      {
        prefix: "pr",
      },
      undefined,
      true
    );

    expect(result.data).toEqual({
      a: 1,
      b: 2,
    });
  });

  it("should send message and return undefined value", async () => {
    const result = await runSendTest(
      undefined,
      (ctx) => {
        ctx.res.setBody(ctx.req.body);
      },
      undefined,
      undefined,
      true
    );

    expect(result.data).toBeUndefined();
  });

  it("should emit message", async () => {
    await runEmitTest(
      true,
      (ctx) => {
        expect(ctx.req.body).toBe(true);
      },
      undefined,
      undefined,
      true
    );
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
    const client = new MicroRedisClient(localTest ? localOptions : undefined);
    client.emit("", "");
  });

  it("should create custom connection", async () => {
    class TestClass extends MicroRedisConnection {}
    const obj = new TestClass();
    expect(!!obj["initClients"]).toBeTruthy();
  });
});
