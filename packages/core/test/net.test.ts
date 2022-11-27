import { Server, AddressInfo } from "net";
import { netListen, netDynamicListen, logNetListen, netClose } from "../src";

describe("listen", () => {
  it("should listen with default port", async () => {
    const server = new Server();
    netListen(server);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await netClose(server, console as any);
  });

  it("should listen with custom port and host", async () => {
    const server = new Server();
    netListen(server, 23431, "127.0.0.1");

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await netClose(server, console as any);
  });

  it("should listen with env IPARE_DEBUG_PORT", async () => {
    const port = 23432;
    process.env.IPARE_DEBUG_PORT = port.toString();
    const server = new Server();
    netListen(server, {
      port: port + 1,
    });

    process.env.IPARE_DEBUG_PORT = "";

    await new Promise<void>((resolve) => {
      server.once("listening", () => {
        resolve();
      });
    });

    const address = server.address();
    await netClose(server, console as any);

    if (typeof address == "object") {
      expect(address?.port).toBe(port);
    } else {
      expect(address.includes(":" + port));
    }
  }, 10000);

  it("should listen with path pipe", async () => {
    const server = new Server();
    netListen(server, "test");

    await new Promise<void>((resolve) => {
      server.on("error", () => {
        resolve();
      });
    });
    await netClose(server, console as any);
  });

  it("should listen with handle", async () => {
    const port = 23433;

    const server1 = new Server();
    netListen(server1, port);
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    const server2 = new Server();
    netListen(server2, server1);
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    await netClose(server1, console as any);
    await netClose(server2, console as any);
  });
});

describe("dynamic listen", () => {
  it("should dynamic with default port", async () => {
    const server = new Server();
    const port = await netDynamicListen(server);
    await netClose(server, console as any);

    expect(!!port).toBeTruthy();
  });

  it("should find next port to listen", async () => {
    const port = 23441;
    const server1 = new Server();
    const port1 = await netDynamicListen(server1, port);

    const server2 = new Server();
    const port2 = await netDynamicListen(server2, port);

    await netClose(server1, console as any);
    await netClose(server2, console as any);

    expect(port1).toBe(port);
    expect(port2).toBe(port + 1);
  });

  it("should ignore error after listen success", async () => {
    const server = new Server();
    const port = await netDynamicListen(server);
    server.emit("error", new Error("err"));

    await netClose(server, console as any);

    expect(!!port).toBeTruthy();
  });

  it("should throw error with error host", async () => {
    const server = new Server();
    let error: any;
    try {
      await netDynamicListen(server, 80, "ipare.org");
    } catch (err) {
      error = err;
    }

    await netClose(server, console as any);
    expect(error.code).toBe("EADDRNOTAVAIL");
  });
});

describe("log", () => {
  it("should log address with string", async () => {
    let address: any;
    logNetListen(
      {
        address: () => {
          return "string address";
        },
      } as any,
      {
        info: (val: string) => {
          address = val;
        },
      } as any
    );
    expect(address).toBe("Server started, listening address: string address");
  });

  it("should log address with object", async () => {
    let address: any;
    logNetListen(
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
      } as any
    );
    expect(address).toBe("Server started, listening address: 127.0.0.1:2333");
  });

  it("should log address with object add address is ::", async () => {
    let address: any;
    logNetListen(
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
      } as any
    );
    expect(address).toBe(
      "Server started, listening address: http://localhost:2333"
    );
  });
});
