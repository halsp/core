import {
  MicroRedisClient,
  MicroRedisConnection,
  MicroRedisStartup,
} from "../src";
import { mockConnection, mockConnectionFrom } from "../src/mock";
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

  it("should create custom connection", async () => {
    class TestClass extends MicroRedisConnection {}
    const obj = new TestClass();
    expect(!!obj["initClients"]).toBeTruthy();
  });
});

describe("not connected", () => {
  it("should not emit data when client redis is not connected", async () => {
    const client = new MicroRedisClient(localTest ? localOptions : undefined);

    let err: any;
    try {
      client.emit("", "");
    } catch (error) {
      err = error as Error;
    }
    expect(err.message).toBe("The connection is not connected");
  });

  it("should retrn error when client redis is not connected", async () => {
    const client = new MicroRedisClient(localTest ? localOptions : undefined);
    const result = client.send("", "");
    expect((await result).error).toBe("The connection is not connected");
  });

  it("should not emit data when pub is undefined", async () => {
    const client = new MicroRedisClient(localTest ? localOptions : undefined);
    if (!localTest) {
      mockConnection.bind(client)();
    }
    client.connect();
    client["pub"] = undefined;

    let err: any;
    try {
      client.emit("", "");
    } catch (error) {
      err = error as Error;
    }
    expect(err.message).toBe("The connection is not connected");
  });

  it("should retrn error when client pub is undefined", async () => {
    const client = new MicroRedisClient(localTest ? localOptions : undefined);
    if (!localTest) {
      mockConnection.bind(client)();
    }
    client.connect();
    client["pub"] = undefined;

    const result = client.send("", "");
    expect((await result).error).toBe("The connection is not connected");
  });
});

describe("timeout", () => {
  it("should return error when send timeout and set timeout options", async () => {
    const result = await runSendTest(
      true,
      (ctx) => {
        ctx.res.setBody(ctx.req.body);
      },
      {
        host: "localhost",
        port: 6379,
      },
      {
        sendTimeout: 1000,
      },
      true
    );
    expect(result.data).toBe(true);
  }, 10000);

  it("should return error when send timeout and set timeout argument", async () => {
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
      true,
      1000
    );
    expect(result.data).toBe(true);
  }, 10000);

  it("should return error when send timeout", async () => {
    const startup = new MicroRedisStartup();
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

    const result = await client.send("test_timeout", "", 1000);

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        resolve();
      }, 500);
    });

    expect(result.error).toBe("Send timeout");
  }, 10000);
});
