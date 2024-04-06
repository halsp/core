import net, { Server, AddressInfo } from "net";
import { closeServer, logAddress, getHalspPort } from "../src";
import { getAvailablePort } from "../src";

describe("close", () => {
  it("should close server", async () => {
    const server = new Server();
    server.listen();
    await closeServer(server);
  });

  it("should close without listen", async () => {
    const server = new Server();
    await closeServer(server);
  });

  it("should throw error when close failed", async () => {
    const server = new Server();
    server.listen();
    const close = server.close;
    server.close = (cb: (err?: Error | undefined) => void) => {
      close.bind(server)();
      cb(new Error("err"));
      return server;
    };

    let error: any;
    try {
      await closeServer(server);
    } catch (err) {
      error = err;
    }
    expect(error.message).toBe("err");
  });
});

describe("log", () => {
  it("should log address with string", async () => {
    let address: any;
    logAddress(
      {
        address: () => {
          return "string address";
        },
      } as any,
      {
        info: (val: string) => {
          address = val;
        },
      } as any,
      "",
    );
    expect(address).toBe("Server started, listening address: string address");
  });

  it("should log address with object", async () => {
    let address: any;
    logAddress(
      {
        address: () => {
          return {
            address: "127.0.0.1",
            port: 2333,
          } as AddressInfo;
        },
      } as any,
      {
        info: (val: string) => {
          address = val;
        },
      } as any,
      "",
    );
    expect(address).toBe("Server started, listening address: 127.0.0.1:2333");
  });

  it("should log address with object add address is ::", async () => {
    let address: any;
    logAddress(
      {
        address: () => {
          return {
            address: "::",
            port: 2333,
          } as AddressInfo;
        },
      } as any,
      {
        info: (val: string) => {
          address = val;
        },
      } as any,
      "def",
    );
    expect(address).toBe("Server started, listening address: def:2333");
  });
});

describe("port", () => {
  it("should get port without change when HALSP_DEBUG_PORT is undefined", async () => {
    const port = 23431;
    const realPort = getHalspPort(port);
    expect(realPort).toBe(port);
  });

  it("should get debug port when HALSP_DEBUG_PORT is defined", async () => {
    const port = 23432;
    process.env.HALSP_DEBUG_PORT = port.toString();
    const realPort = getHalspPort(port - 1);
    process.env.HALSP_DEBUG_PORT = "";
    expect(realPort).toBe(port);
  });
});

describe("port", () => {
  it("should get available port", async () => {
    const port = (await getAvailablePort()) ?? 0;
    expect(port >= 9504).toBeTruthy();
  });

  it("should get available port when port is used", async () => {
    const server = net.createServer();
    server.listen(9602, "127.0.0.1");

    const port = (await getAvailablePort("127.0.0.1", 9602)) ?? 0;
    server.close();
    expect(port > 9602).toBeTruthy();
  });

  it("should get available port error", async () => {
    const existPort = await getAvailablePort("127.0.0.1", 9604);
    const server = net.createServer();
    server.listen(existPort, "127.0.0.1");

    const port = await getAvailablePort("127.0.0.1", existPort, existPort);
    server.close();
    expect(port).toBeUndefined();
  });
});
