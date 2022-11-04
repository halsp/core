import { MicroTcpOptions, MicroTcpStartup } from "../src";
import { sendData, sendMessage } from "./utils";
import net from "net";

describe("startup.listen", () => {
  it("should listen and close", async () => {
    const startup = new MicroTcpStartup();
    const { port } = await startup.dynamicListen();
    expect(port && port > 0).toBeTruthy();

    startup.close();
  });

  it("should listen port 23333", async () => {
    const opts: MicroTcpOptions = {
      port: 23333,
    };
    const server = new MicroTcpStartup(opts).listen();
    server.close();
  });
});

describe("parse message", () => {
  it("should set default result", async () => {
    const startup = new MicroTcpStartup({
      port: 23334,
    });
    const { port } = await startup.dynamicListen();
    const result = await sendMessage(port, true);
    await startup.close();

    expect(result).toEqual({
      id: "123",
      body: undefined,
    });
  });

  it("should return error if there is no '#'", async () => {
    const startup = new MicroTcpStartup({
      port: 23334,
    });
    const { port } = await startup.dynamicListen();
    const result = await sendData(port, "abc");
    await startup.close();

    expect(JSON.parse(result)).toEqual({
      error: `Error message format`,
      status: "error",
    });
  });

  it("should return error if length is nan", async () => {
    const startup = new MicroTcpStartup({
      port: 23334,
    });
    const { port } = await startup.dynamicListen();
    const result = await sendData(port, "abc#{}");
    await startup.close();

    expect(JSON.parse(result)).toEqual({
      error: `Error length "abc"`,
      status: "error",
    });
  });

  it("should return error if length is error", async () => {
    const startup = new MicroTcpStartup({
      port: 23334,
    });
    const { port } = await startup.dynamicListen();
    const result = await sendData(port, "3#{}");
    await startup.close();

    expect(JSON.parse(result)).toEqual({
      error: `Required length "3", bug actual length is "2"`,
      status: "error",
    });
  });

  it("should throw error when socket destroy", async () => {
    const startup = new MicroTcpStartup({
      port: 23334,
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
      port: 23334,
    }).use(() => {
      times++;
    });
    const { port } = await startup.dynamicListen();
    await sendData(port, "2#{}2#{}2#{}");
    await startup.close();

    expect(times).toEqual(3);
  });
});
