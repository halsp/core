import { MicroNatsClient, MicroNatsConnection } from "../src";
import { runEmitTest, runSendTest } from "./utils";

describe("client", () => {
  it("should send message and return boolean value", async () => {
    const result = await runSendTest(
      true,
      (ctx) => {
        ctx.res.setBody(ctx.req.body);
      },
      {
        host: "localhost",
        port: 4222,
      }
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
      }
    );

    expect(result.data).toEqual({
      a: 1,
      b: 2,
    });
  });

  it("should send message and return undefined value", async () => {
    const result = await runSendTest(undefined, (ctx) => {
      ctx.res.setBody(ctx.req.body);
    });

    expect(result.data).toBeUndefined();
  });

  it("should emit message", async () => {
    await runEmitTest(true, (ctx) => {
      expect(ctx.req.body).toBe(true);
    });
  });

  it("should connect error with error host", async () => {
    const client = new MicroNatsClient({
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

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        resolve();
      }, 500);
    });

    await client.dispose();
    expect(err).toBeTruthy();
  });

  it("should listen with default port when port is undefined", async () => {
    const client = new MicroNatsClient();

    try {
      await client.connect();
    } catch (err) {
      console.error(err);
    }
    await client.dispose();
  });

  it("should not send data when client redis is not connected", async () => {
    const client = new MicroNatsClient();
    client.emit("", "");
  });

  it("should create custom connection", async () => {
    class TestClass extends MicroNatsConnection {}
    const obj = new TestClass();
    expect(!!obj["initClients"]).toBeTruthy();
  });
});
