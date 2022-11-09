import { MicroMqttClient, MicroMqttConnection } from "../src";
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
        port: 1883,
      },
      undefined,
      true
    );
    expect(result.data).toBe(true);
  }, 10000);

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
  }, 10000);

  it("should send message and return undefined value", async () => {
    const result = await runSendTest(undefined, (ctx) => {
      ctx.res.setBody(ctx.req.body);
    });

    expect(result.data).toBeUndefined();
  }, 10000);

  it("should emit message", async () => {
    await runEmitTest(true, (ctx) => {
      expect(ctx.req.body).toBe(true);
    });
  }, 10000);

  it("should connect error with error host", async () => {
    const client = new MicroMqttClient({
      port: 443,
      host: "0.0.0.0",
    });

    let err = false;
    await new Promise<void>(async (resolve) => {
      setTimeout(() => {
        err = true;
        resolve();
      }, 1000);
      await client.connect();
      await client.send("", true, 1000);
    });

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        resolve();
      }, 500);
    });

    await client.dispose();
    expect(err).toBeTruthy();
  }, 10000);

  it("should connect success when client emit 'connect' event", async () => {
    const client = new MicroMqttClient({
      port: 443,
      host: "0.0.0.0",
      connectTimeout: 1000,
    });

    let emit = false;
    setTimeout(() => {
      (client as any)["client"].emit("connect");
      emit = true;
    }, 500);
    await client.connect();

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        resolve();
      }, 500);
    });

    await client.dispose();
    expect(emit).toBeTruthy();
  }, 10000);

  it("should listen with default port when port is undefined", async () => {
    const client = new MicroMqttClient({
      subscribeOptions: {
        qos: 1,
      },
    });

    let err = false;
    await new Promise<void>(async (resolve) => {
      setTimeout(() => {
        err = true;
        resolve();
      }, 1000);
      await client.connect();
    });

    await client.dispose();
    expect(err).toBeTruthy();
  });

  it("should not send data when client redis is not connected", async () => {
    const client = new MicroMqttClient(localTest ? localOptions : undefined);
    client.emit("", "");
  });

  it("should create custom connection", async () => {
    class TestClass extends MicroMqttConnection {}
    const obj = new TestClass();
    expect(!!obj["initClients"]).toBeTruthy();
  });
});
