import { Server } from "net";
import { initNetListener, IpareNetListener } from "../src";

describe("listen", () => {
  it("should listen with default port", async () => {
    const listener = {
      logger: console as any,
    } as IpareNetListener;
    const server = new Server();
    initNetListener(listener, server);

    listener.listen();
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    server.removeAllListeners();
    server.close();
  });

  it("should listen with custom port and host", async () => {
    const listener = {
      logger: console as any,
    } as IpareNetListener;
    const server = new Server();
    initNetListener(listener, server);

    listener.listen(23431, "127.0.0.1");
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    server.removeAllListeners();
    server.close();
  });

  it("should listen with env IPARE_DEBUG_PORT", async () => {
    const port = 23432;
    process.env.IPARE_DEBUG_PORT = port.toString();
    const listener = {
      logger: console as any,
    } as IpareNetListener;
    const server = new Server();
    initNetListener(listener, server);

    listener.listen({
      port: port + 1,
    });
    process.env.IPARE_DEBUG_PORT = "";

    await new Promise<void>((resolve) => {
      server.once("listening", () => {
        resolve();
      });
    });

    const address = server.address();
    server.removeAllListeners();
    server.close();

    if (typeof address == "object") {
      expect(address?.port).toBe(port);
    } else {
      expect(address.includes(":" + port));
    }
  }, 10000);

  it("should listen with path pipe", async () => {
    const listener = {
      logger: console as any,
    } as IpareNetListener;
    const server = new Server();
    initNetListener(listener, server);

    listener.listen("test");
    await new Promise<void>((resolve) => {
      server.on("error", () => {
        resolve();
      });
    });
    server.removeAllListeners();
    server.close();
  });

  it("should listen with handle", async () => {
    const port = 23433;

    const listener1 = {
      logger: console as any,
    } as IpareNetListener;
    const server1 = new Server();
    initNetListener(listener1, server1);
    listener1.listen(port);
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    const listener2 = {
      logger: console as any,
    } as IpareNetListener;
    const server2 = new Server();
    initNetListener(listener2, server2);
    listener2.listen(server1);
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    server2.removeAllListeners();
    server2.close();
    server1.removeAllListeners();
    server1.close();
  });

  it("should log address with string", async () => {
    const listener = {
      logger: console as any,
    } as IpareNetListener;
    const server = new Server();
    initNetListener(listener, server);

    server.address = () => {
      return "string address";
    };
    server.emit("listening");
    server.removeAllListeners();
    server.close();
  });
});

describe("dynamic listen", () => {
  it("should dynamic with default port", async () => {
    const listener = {
      logger: console as any,
    } as IpareNetListener;
    const server = new Server();
    initNetListener(listener, server);
    const { port } = await listener.dynamicListen();

    server.removeAllListeners();
    server.close();

    expect(!!port).toBeTruthy();
  });

  it("should find next port to listen", async () => {
    const port = 23441;
    const listener1 = {
      logger: console as any,
    } as IpareNetListener;
    const server1 = new Server();
    initNetListener(listener1, server1);
    const { port: port1 } = await listener1.dynamicListen(port);

    const listener2 = {
      logger: console as any,
    } as IpareNetListener;
    const server2 = new Server();
    initNetListener(listener2, server2);
    const { port: port2 } = await listener2.dynamicListen(port);

    server1.removeAllListeners();
    server1.close();
    server2.removeAllListeners();
    server2.close();

    expect(port1).toBe(port);
    expect(port2).toBe(port + 1);
  });

  it("should ignore error after listen success", async () => {
    const listener = {
      logger: console as any,
    } as IpareNetListener;
    const server = new Server();
    initNetListener(listener, server);
    const { port } = await listener.dynamicListen();
    server.emit("error", new Error("err"));

    server.removeAllListeners();
    server.close();

    expect(!!port).toBeTruthy();
  });

  it("should throw error with error host", async () => {
    const listener = {
      logger: console as any,
    } as IpareNetListener;
    const server = new Server();
    initNetListener(listener, server);
    let error: any;
    try {
      await listener.dynamicListen(80, "ipare.org");
    } catch (err) {
      error = err;
    }

    server.removeAllListeners();
    server.close();
    expect(error.code).toBe("EADDRNOTAVAIL");
  });
});
