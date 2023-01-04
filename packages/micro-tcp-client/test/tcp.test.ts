import { MicroTcpClient } from "../src";
import { MicroTcpStartup } from "@ipare/micro-tcp";

describe("client", () => {
  it("should send message and return boolean value", async () => {
    const startup = new MicroTcpStartup({
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
    await client["connect"]();
    const result = await client.send("test_pattern", true);
    await client.dispose();
    await startup.close();

    expect(result).toBe(true);
  });

  it("should send message and return value when use prefix", async () => {
    const startup = new MicroTcpStartup()
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
      })
      .pattern("pftest_pattern", () => undefined);
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
      prefix: "pf",
    });
    await client["connect"]();
    const result = await client.send("test_pattern", "abc");
    await client.dispose();
    await startup.close();

    expect(result).toBe("abc");
  });

  it("should send message and return undefined value", async () => {
    const startup = new MicroTcpStartup({
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
    await client["connect"]();
    const result = await client.send("test_pattern", undefined);
    await client.dispose();
    await startup.close();

    expect(result).toBeUndefined();
  });

  it("should emit message", async () => {
    let invoke = false;
    const startup = new MicroTcpStartup({
      port: 23334,
    })
      .use(() => {
        invoke = true;
      })
      .pattern("test_pattern", () => undefined);
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
    });
    await client["connect"]();
    client.emit("test_pattern", true);

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        await client.dispose();
        await startup.close();
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

    let consoleError = false;
    const beforeError = console.error;
    console.error = () => {
      consoleError = true;
      console.error = beforeError;
    };
    await client["connect"]();
    console.error = beforeError;
    expect(consoleError).toBeTruthy();

    let sendError: any;
    try {
      await client.send("", true);
    } catch (err) {
      sendError = err as Error;
    }
    let emitError: any;
    try {
      client.emit("", "");
    } catch (err) {
      emitError = err as Error;
    }

    client.dispose();

    expect(emitError.message).toBe("The connection is not connected");
    expect(sendError.message).toBe("The connection is not connected");
  });

  it("should listen with default port when port is undefined", async () => {
    const client = new MicroTcpClient({
      host: "0.0.0.0",
    });
    try {
      await client["connect"]();
    } catch (err) {}
    await client.dispose();
  });

  it("should wait all times with timeout = 0", async () => {
    const startup = new MicroTcpStartup({
      port: 23334,
    })
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
      })
      .pattern("test_pattern", () => undefined);
    const { port } = await startup.dynamicListen();
    startup["handleMessage"] = () => new Promise((resolve) => resolve());

    const client = new MicroTcpClient({
      port,
    });
    await client["connect"]();

    const waitResult = await new Promise<boolean>(async (resolve) => {
      setTimeout(() => resolve(true), 500);
      await client.send("test_pattern", "", 0);
      resolve(false);
    });
    await client.dispose();
    await startup.close();

    expect(waitResult).toBeTruthy();
  });

  it("should throw error when send timeout and set timeout options", async () => {
    const startup = new MicroTcpStartup({
      port: 23334,
    })
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
      })
      .pattern("test_pattern", () => undefined);
    const { port } = await startup.dynamicListen();
    startup["handleMessage"] = () => new Promise((resolve) => resolve());

    const client = new MicroTcpClient({
      port,
      sendTimeout: 1000,
    });
    await client["connect"]();

    let error: any;
    try {
      await client.send("test_pattern", "");
    } catch (err) {
      error = err;
    }
    await client.dispose();
    await startup.close();

    expect(error.message).toBe("Send timeout");
  }, 10000);

  it("should throw error when send timeout and set timeout argument", async () => {
    const startup = new MicroTcpStartup({
      port: 23334,
    })
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
      })
      .pattern("test_pattern", () => undefined);
    const { port } = await startup.dynamicListen();
    startup["handleMessage"] = () => new Promise((resolve) => resolve());

    const client = new MicroTcpClient({
      port,
    });
    await client["connect"]();

    let error: any;
    try {
      await client.send("test_pattern", "", 1000);
    } catch (err) {
      error = err;
    }
    await client.dispose();
    await startup.close();

    expect(error.message).toBe("Send timeout");
  }, 10000);

  it("should throw error when result.error is defined", async () => {
    const startup = new MicroTcpStartup({
      port: 23335,
    })
      .use((ctx) => {
        ctx.res.setError("err");
      })
      .pattern("test_pattern", () => undefined);
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
    });
    await client["connect"]();

    let error: any;
    try {
      await client.send("test_pattern", "");
    } catch (err) {
      error = err;
    }
    await client.dispose();
    await startup.close();

    expect(error.message).toBe("err");
  }, 10000);

  it("should clouse when emit close event", async () => {
    const startup = new MicroTcpStartup({
      port: 23336,
    }).use((ctx) => {
      ctx.res.setBody(ctx.req.body);
    });
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
    });
    const socket = await client["connect"]();
    socket.emit("close");

    await client.dispose();
    await startup.close();
  });

  it("should create client by default port and host", () => {
    new MicroTcpClient();
  });
});
