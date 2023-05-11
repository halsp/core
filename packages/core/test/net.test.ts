import { Server, AddressInfo } from "net";
import { dynamicListen, closeServer, logAddress, getHalspPort } from "../src";

describe("dynamic listen", () => {
  it("should dynamic with default port", async () => {
    const server = new Server();
    const port = await dynamicListen(server);
    await closeServer(server);

    expect(!!port).toBeTruthy();
  });

  it("should close without listen", async () => {
    const server = new Server();
    await closeServer(server);
  });

  it("should find next port to listen", async () => {
    const port = 23441;
    const server1 = new Server();
    const port1 = await dynamicListen(server1, port);

    const server2 = new Server();
    const port2 = await dynamicListen(server2, port);

    await closeServer(server1);
    await closeServer(server2);

    expect(port1).toBe(port);
    expect(port2).toBe(port + 1);
  });

  it("should ignore error after listen success", async () => {
    const server = new Server();
    const port = await dynamicListen(server);
    server.emit("error", new Error("err"));

    await closeServer(server);

    expect(!!port).toBeTruthy();
  });

  it("should throw error with error host", async () => {
    const server = new Server();
    let error: any;
    try {
      await dynamicListen(server, 80, "halsp.org");
    } catch (err) {
      error = err;
    }

    expect(error.code).toBe("EADDRNOTAVAIL");
  });

  it("should throw error with close failed", async () => {
    const server = new Server();
    await dynamicListen(server);
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
      ""
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
      ""
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
      "def"
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
