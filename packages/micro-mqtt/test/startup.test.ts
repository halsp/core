import "../src/server";
import { MicroMqttClient } from "../src/client";
import { Startup } from "@halsp/core";

describe("startup", () => {
  it("should subscribe and publish", async () => {
    const startup = new Startup()
      .useMicroMqtt({
        servers: [
          {
            host: "127.0.0.1",
            port: 6002,
          },
        ],
      })
      .useMicroMqtt()
      .register("test_pattern", (ctx) => {
        ctx.res.body = ctx.req.body;
        expect(!!ctx.req.packet).toBeTruthy();
      });
    await startup.listen();

    const client = new MicroMqttClient({
      host: "127.0.0.1",
      port: 6002,
    });
    await client["connect"]();
    const result = await client.send("test_pattern", "test_body");

    await startup.close();
    await client.dispose(true);

    expect(result).toBe("test_body");
  }, 10000);

  it("should subscribe and publish with subscribeOptions and publishOptions", async () => {
    const startup = new Startup()
      .useMicroMqtt({
        host: "127.0.0.1",
        port: 6002,
        subscribeOptions: { qos: 1 },
        publishOptions: {},
      })
      .register("test_pattern_subscribe", (ctx) => {
        ctx.res.body = ctx.req.body;
      });
    await startup.listen();

    const client = new MicroMqttClient({
      host: "127.0.0.1",
      port: 6002,
    });
    await client["connect"]();
    const result = await client.send("test_pattern_subscribe", "test_body");

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await startup.close();
    await client.dispose(true);

    expect(result).toBe("test_body");
  }, 10000);

  it("should subscribe without publish when pattern is not matched", async () => {
    const startup = new Startup().useMicroMqtt({
      host: "127.0.0.1",
      port: 6002,
    });
    const server = await startup.listen();
    server.subscribe("test_pattern_not_matched");

    const client = new MicroMqttClient({
      host: "127.0.0.1",
      port: 6002,
    });
    await client["connect"]();

    let error: any;
    try {
      await client.send("test_pattern_not_matched", "test_body", {
        timeout: 1000,
      });
    } catch (err) {
      error = err;
    }

    await startup.close();
    await client.dispose(true);

    expect(error.message).toBe("Send timeout");
  }, 10000);
});

describe("HALSP_DEBUG_PORT", () => {
  it("should listen with HALSP_DEBUG_PORT", async () => {
    process.env.HALSP_DEBUG_PORT = "6002";
    const startup = new Startup().useMicroMqtt();
    const client = await startup.listen();
    process.env.HALSP_DEBUG_PORT = "";

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await startup.close();

    expect(!!client).toBeTruthy();
  }, 10000);
});

describe("error", () => {
  it("should reject error when client emit error", async () => {
    const startup = new Startup().useMicroMqtt({
      host: "127.0.0.1",
      port: 6002,
    });
    const server = await startup.listen();
    server.emit("error", new Error("err"));

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await startup.close();
  }, 10000);

  it("should throw error when client close error", async () => {
    const startup = new Startup().useMicroMqtt({
      host: "127.0.0.1",
      port: 6002,
    });
    const client = await startup.listen();

    const end = client.end;
    Object.defineProperty(client, "end", {
      value: (force: boolean, obj: any, cb: any) => {
        try {
          cb(new Error("err"));
        } finally {
          return end.bind(client)(force, obj, cb);
        }
      },
    });

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    let error: any;
    try {
      await startup.close();
    } catch (err) {
      error = err;
    }

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    expect(error.message).toBe("err");
  }, 10000);

  it("should force shutdown when shutdown timeout", async () => {
    const startup = new Startup().useMicroMqtt({
      host: "127.0.0.1",
      port: 6002,
    });
    const client = await startup.listen();

    let forceShutdown = false;
    const end = client.end;
    Object.defineProperty(client, "end", {
      value: (force: boolean, obj: any, cb: any) => {
        if (force) {
          forceShutdown = true;
          cb();
          end.bind(client)(force, obj, cb);
        } else {
          setTimeout(() => cb(), 2200);
        }
        return client;
      },
    });

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    await startup.close();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    expect(forceShutdown).toBeTruthy();
  }, 10000);

  it("should throw error when host is invalid", async () => {
    const client = new Startup().useMicroMqtt({
      host: "not-exist.halsp.org",
      connectTimeout: 500,
    });

    await expect(client.listen).rejects.toThrow();
    await new Promise<void>((r) => setTimeout(r, 1000));
    await client.close();
  }, 10000);
});
