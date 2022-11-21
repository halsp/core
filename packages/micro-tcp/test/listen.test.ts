import { MicroTcpStartup } from "../src";
import { sendMessage } from "./utils";

describe("dynamicListen", () => {
  it("should listen with next port", async () => {
    const startup = new MicroTcpStartup({
      port: 23345,
    });
    const { server, port } = await startup
      .pattern("test_pattern", async (ctx) => {
        const { server, port } = await new MicroTcpStartup({
          port: 23345,
        }).dynamicListen();
        server.close();
        ctx.res.setBody(port);
      })
      .dynamicListen();

    expect(startup.server).toBe(server);
    const res = await sendMessage(port, true);
    expect(res.error).toBeUndefined();
    expect(port + 1).toBe(res.data);
    await startup.close();
  });

  it("should listen error when use dynamicListen with error host", async () => {
    let error = false;
    try {
      const { server } = await new MicroTcpStartup({
        port: 80,
        host: "github.com",
      }).dynamicListen();
      server.close();
    } catch (err) {
      expect((err as any).code).toBe("EADDRNOTAVAIL");
      error = true;
    }
    expect(error).toBeTruthy();
  });

  it("should emit error when use dynamicListen", async () => {
    const { server, port } = await new MicroTcpStartup({
      port: 23334,
    })
      .pattern("test_pattern", async (ctx) => {
        ctx.res.setBody("ok");
      })
      .dynamicListen();
    server.once("connection", () => {
      server.emit("error");
    });

    const res = await sendMessage(port, true);
    expect(res.data).toBe("ok");
    server.close();
  });

  it("should listen with IPARE_DEBUG_PORT", async () => {
    process.env.IPARE_DEBUG_PORT = "23345";
    const startup = new MicroTcpStartup();
    const { server, port } = await startup
      .pattern("test_pattern", () => undefined)
      .dynamicListen();
    process.env.IPARE_DEBUG_PORT = "";

    expect(startup.server).toBe(server);
    expect(port).toBe(23345);
    await startup.close();
  });
});
