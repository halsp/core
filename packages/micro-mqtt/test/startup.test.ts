import { MicroMqttStartup } from "../src";
import { MicroMqttClient } from "@halsp/micro-mqtt-client";
import * as mqtt from "mqtt";

describe("startup", () => {
  it("should subscribe and publish", async () => {
    const startup = new MicroMqttStartup({
      servers: [
        {
          host: "127.0.0.1",
          port: 6002,
        },
      ],
    }).pattern("test_pattern", (ctx) => {
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

    await startup.close(true);
    await client.dispose(true);

    expect(result).toBe("test_body");
  });

  it("should subscribe and publish with subscribeOptions and publishOptions", async () => {
    const startup = new MicroMqttStartup({
      host: "127.0.0.1",
      port: 6002,
      subscribeOptions: { qos: 1 },
      publishOptions: {},
    }).patterns({
      pattern: "test_pattern_subscribe",
      handler: (ctx) => {
        ctx.res.body = ctx.req.body;
      },
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
    await startup.close(true);
    await client.dispose(true);

    expect(result).toBe("test_body");
  });

  it("should subscribe without publish when pattern is not matched", async () => {
    const startup = new MicroMqttStartup({
      host: "127.0.0.1",
      port: 6002,
    });
    await startup.listen();
    startup["client"]?.subscribe("test_pattern_not_matched");

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

    await startup.close(true);
    await client.dispose(true);

    expect(error.message).toBe("Send timeout");
  });
});

describe("HALSP_DEBUG_PORT", () => {
  it("should listen with HALSP_DEBUG_PORT", async () => {
    process.env.HALSP_DEBUG_PORT = "6002";
    const startup = new MicroMqttStartup();
    const client = await startup.listen();
    process.env.HALSP_DEBUG_PORT = "";

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await startup.close(true);

    expect(!!client).toBeTruthy();
  });
});

describe("error", () => {
  it("should reject error when client emit error", async () => {
    const startup = new MicroMqttStartup({
      host: "127.0.0.1",
      port: 6002,
    });
    await startup.listen();
    startup["client"]?.emit("error", new Error("err"));

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await startup.close(true);
  });

  it("should throw error when client close error", async () => {
    const startup = new MicroMqttStartup({
      host: "127.0.0.1",
      port: 6002,
    });
    await startup.listen();

    const client = startup["client"] as mqtt.MqttClient;
    const end = client.end;
    client.end = (force: boolean, obj: any, cb: any) => {
      try {
        cb(new Error("err"));
      } finally {
        return end.bind(client)(force, obj, cb);
      }
    };

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    let error: any;
    try {
      await startup.close(true);
    } catch (err) {
      error = err;
    }

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    expect(error.message).toBe("err");
  });

  it("should throw error when host is invalid", async () => {
    const client = new MicroMqttStartup({
      host: "not-exist.halsp.org",
      connectTimeout: 500,
    });

    let error: any;
    try {
      await client.listen();
    } catch (err) {
      error = err;
    }

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 600);
    });

    await client.close(true);

    expect(error.message).toBe("getaddrinfo ENOTFOUND not-exist.halsp.org");
  });
});
