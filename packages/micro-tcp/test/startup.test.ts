import { MicroTcpOptions, MicroTcpStartup } from "../src";
import { sendData, sendMessage } from "./utils";
import net, { Server } from "net";

import { MicroTcpClient } from "@halsp/micro-tcp-client";

describe("startup.listen", () => {
  it("should listen and close", async () => {
    const startup = new MicroTcpStartup();
    const { port } = await startup.dynamicListen();
    expect(port && port > 0).toBeTruthy();

    startup.close();
  });

  it("should listen default port", async () => {
    try {
      const server = new MicroTcpStartup().listen();
      server.on("error", () => undefined);
      server.close();
    } catch {}
  });

  it("should listen port 23333", async () => {
    const opts: MicroTcpOptions = {
      port: 23333,
      serverOpts: {},
    };
    const server = new MicroTcpStartup(opts).listen();
    server.close();
  });

  it("should listen port 23333", async () => {
    const opts: MicroTcpOptions = {
      port: 23333,
      serverOpts: {},
    };
    const server = new MicroTcpStartup(opts).listen();
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
    const server = new MicroTcpStartup(opts).listen();
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    server.close();
  });

  it("should listen with pipe path", async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    const opts: MicroTcpOptions = {
      path: "//pipe/foo",
    };
    const server = new MicroTcpStartup(opts).listen();
    await new Promise<void>((resolve) => {
      server.on("error", () => resolve());
    });
    server.close();
  });
});

describe("parse message", () => {
  it("should set default result", async () => {
    const startup = new MicroTcpStartup({
      port: 23334,
    }).pattern("test_pattern", () => undefined);
    const { port } = await startup.dynamicListen();
    const result = await sendMessage(port, true);
    await startup.close();

    expect(result).toEqual({
      id: "123",
      data: undefined,
    });
  });

  it("should return error if there is no '#'", async () => {
    const startup = new MicroTcpStartup({
      port: 23335,
    });
    const { port } = await startup.dynamicListen();
    const result = await sendData(port, "abc");
    await startup.close();

    expect(result).toEqual({
      error: `Error message format`,
    });
  });

  it("should return error if length is nan", async () => {
    const startup = new MicroTcpStartup({
      port: 23336,
    });
    const { port } = await startup.dynamicListen();
    const result = await sendData(port, "abc#{}");
    await startup.close();

    expect(result).toEqual({
      error: `Error length "abc"`,
    });
  });

  it("should return error if length is error", async () => {
    const startup = new MicroTcpStartup({
      port: 23337,
    });
    const { port } = await startup.dynamicListen();
    const result = await sendData(port, "3#{}");
    await startup.close();

    expect(result).toEqual({
      error: `Required length "3", bug actual length is "2"`,
    });
  });

  it("should throw error when socket destroy", async () => {
    const startup = new MicroTcpStartup({
      port: 23338,
    });
    const { port } = await startup.dynamicListen();

    const socket = net.createConnection(port);
    socket.on("connect", async () => {
      socket.write("abc");
      socket.destroy();
      await startup.close();
    });
  });

  it("should invoke multiple times when send multiple message", async () => {
    let times = 0;
    const startup = new MicroTcpStartup({
      port: 23339,
    })
      .use(() => {
        times++;
      })
      .pattern("test_pattern", () => undefined);
    const { port } = await startup.dynamicListen();
    const jsonData = JSON.stringify({
      pattern: "test_pattern",
    });
    const sendStr = `${jsonData.length}#${jsonData}`;
    await sendData(port, `${sendStr}${sendStr}${sendStr}`, false);
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
    const startup = new MicroTcpStartup({
      port: 23340,
    })
      .use((ctx) => {
        ctx.res.setBody(ctx.socket);
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

    expect(result).toBeTruthy();
  });

  it("should log error when socket emit error", async () => {
    const startup = new MicroTcpStartup({
      port: 23341,
    })
      .use((ctx) => {
        ctx.socket.emit("error", new Error("err"));
      })
      .patterns({
        pattern: "test_pattern",
        handler: () => undefined,
      });
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
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
    const startup = new MicroTcpStartup({
      port: 23342,
    });
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
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
    const startup = new MicroTcpStartup({
      port: 23344,
    });
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
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
    const startup = new MicroTcpStartup({
      port: 23345,
    }).pattern("test_pattern", () => undefined);
    const { port } = await startup.dynamicListen();

    const client = new MicroTcpClient({
      port,
    });
    await client["connect"]();

    startup["handleMessage"] = () => {
      throw new Error("err");
    };

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
