import { MicroTcpOptions } from "../src";
import "../src";
import { sendData, sendMessage } from "./utils";
import net, { Server } from "net";

import { MicroTcpClient } from "@halsp/micro-tcp-client";
import { Startup } from "@halsp/core";

describe("startup.listen", () => {
  it("should listen and close", async () => {
    const startup = new Startup().useMicroTcp().useMicroTcp();
    const server = await startup.listen();
    expect(!!server).toBeTruthy();

    startup.close();
  });

  it("should listen default port", async () => {
    try {
      const server = await new Startup().useMicroTcp().listen();
      server.on("error", () => undefined);
      server.close();
    } catch {}
  });

  it("should listen port 23333", async () => {
    const server = await new Startup()
      .useMicroTcp({
        port: 23333,
      })
      .listen();
    server.close();
  });

  it("should listen port 23333", async () => {
    const server = await new Startup()
      .useMicroTcp({
        port: 23333,
      })
      .listen();
    server.close();
  });

  it("should listen with handle", async () => {
    const baseServer = new Server();
    baseServer.listen(23367);
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    const opts: MicroTcpOptions = {
      handle: baseServer,
    };
    const server = await new Startup().useMicroTcp(opts).listen();
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    server.close();
  });
});

describe("parse message", () => {
  it("should set default result", async () => {
    const startup = new Startup()
      .useMicroTcp({
        port: 23334,
      })
      .register("test_pattern", () => undefined);
    await startup.listen();
    const result = await sendMessage(23334, true);
    await startup.close();

    expect(result).toEqual({
      id: "123",
      data: undefined,
    });
  });

  it("should return error if there is no '#'", async () => {
    const startup = new Startup().useMicroTcp({
      port: 23335,
    });
    await startup.listen();
    const result = await sendData(23335, "abc");
    await startup.close();

    expect(result).toEqual({
      error: `Error message format`,
    });
  });

  it("should return error if length is nan", async () => {
    const startup = new Startup().useMicroTcp({
      port: 23336,
    });
    await startup.listen();
    const result = await sendData(23336, "abc#{}");
    await startup.close();

    expect(result).toEqual({
      error: `Error length "abc"`,
    });
  });

  it("should return error if length is error", async () => {
    const startup = new Startup().useMicroTcp({
      port: 23337,
    });
    await startup.listen();
    const result = await sendData(23337, "3#{}");
    await startup.close();

    expect(result).toEqual({
      error: `Required length "3", bug actual length is "2"`,
    });
  });

  it("should throw error when socket destroy", async () => {
    const startup = new Startup().useMicroTcp({
      port: 23338,
    });
    await startup.listen();

    const socket = net.createConnection(23338);
    socket.on("connect", async () => {
      socket.write("abc");
      socket.destroy();
      await startup.close();
    });
  });

  it("should invoke multiple times when send multiple message", async () => {
    let times = 0;
    const startup = new Startup()
      .useMicroTcp({
        port: 23339,
      })
      .use(() => {
        times++;
      })
      .register("test_pattern");
    await startup.listen();
    const jsonData = JSON.stringify({
      pattern: "test_pattern",
    });
    const sendStr = `${jsonData.length}#${jsonData}`;
    await sendData(23339, `${sendStr}${sendStr}${sendStr}`, false);
    let i = 0;
    while (i < 30 && times < 3) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      i++;
    }
    await startup.close();

    expect(times).toEqual(3);
  });
});

describe("socket", () => {
  it("should get socket from ctx", async () => {
    const startup = new Startup()
      .useMicroTcp({
        port: 23340,
      })
      .use((ctx) => {
        ctx.res.setBody(ctx.socket);
      })
      .register("test_pattern");
    await startup.listen();

    const client = new MicroTcpClient({
      port: 23340,
    });
    await client["connect"]();
    const result = await client.send("test_pattern", true);
    await client.dispose();
    await startup.close();

    expect(result).toBeTruthy();
  });

  it("should log error when socket emit error", async () => {
    const startup = new Startup()
      .useMicroTcp({
        port: 23341,
      })
      .use((ctx) => {
        ctx.socket.emit("error", new Error("err"));
      })
      .register("test_pattern");
    await startup.listen();

    const client = new MicroTcpClient({
      port: 23341,
    });
    await client["connect"]();

    let err: any;
    const beforeError = console.error;
    console.error = (error: Error) => {
      err = error.message;
      console.error = beforeError;
    };
    await client.send("test_pattern", true);
    console.error = beforeError;

    await client.dispose();
    await startup.close();

    expect(err).toBe("err");
  });

  it("should return error when send pattern is not exist", async () => {
    const startup = new Startup().useMicroTcp({
      port: 23342,
    });
    await startup.listen();

    const client = new MicroTcpClient({
      port: 23342,
    });
    await client["connect"]();

    let error: any;
    try {
      await client.send("test_pattern", true);
    } catch (err) {
      error = err;
    }

    await client.dispose();
    await startup.close();

    expect(error.message).toBe(`Can't find the pattern: test_pattern`);
  });

  it("should log error when emit pattern is not exist", async () => {
    const startup = new Startup().useMicroTcp({
      port: 23344,
    });
    await startup.listen();

    const client = new MicroTcpClient({
      port: 23344,
    });
    await client["connect"]();
    client.emit("test_pattern", true);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    await client.dispose();
    await startup.close();
  });

  it("should return Internal Error when handle message error", async () => {
    const startup = new Startup()
      .useMicroTcp({
        port: 23345,
      })
      .register("test_pattern", () => {
        throw new Error("err");
      });
    await startup.listen();

    const client = new MicroTcpClient({
      port: 23345,
    });
    await client["connect"]();

    let error: any;
    try {
      await client.send("test_pattern", true);
    } catch (err) {
      error = err;
    }

    await client.dispose();
    await startup.close();

    expect(error.message).toBe("Internal Error");
  });
});
