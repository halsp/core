import { MicroMqttStartup } from "@halsp/micro-mqtt";
import { MicroMqttClient } from "../src";
import * as mqtt from "mqtt";

describe("error", () => {
  it("should throw error when client close error", async () => {
    const mqttClient = new MicroMqttClient({
      host: "127.0.0.1",
      port: 6002,
    });
    await mqttClient["connect"]();

    const client = mqttClient["client"] as mqtt.MqttClient;
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
      await mqttClient.dispose(true);
    } catch (err) {
      error = err;
    }

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    expect(error.message).toBe("err");
  });

  it("should throw error when host is invalid", async () => {
    const client = new MicroMqttClient({
      host: "not-exist.halsp.org",
      connectTimeout: 500,
    });

    let error: any;
    try {
      await client["connect"]();
    } catch (err) {
      error = err;
    }

    await client.dispose(true);
    expect(error.message).toBe("getaddrinfo ENOTFOUND not-exist.halsp.org");
  });

  it("should throw error when result.error is defined", async () => {
    const startup = new MicroMqttStartup({
      port: 6002,
    })
      .pattern("test_pattern", () => undefined)
      .use((ctx) => {
        ctx.res.setError("err");
      });
    await startup.listen();

    const client = new MicroMqttClient({
      port: 6002,
    });
    await client["connect"]();
    client["client"]?.emit("error", new Error("err")); // Not working

    let error: any;
    try {
      await client.send("test_pattern", "test_body");
    } catch (err) {
      error = err;
    }

    await startup.close(true);
    await client.dispose(true);

    expect(error.message).toBe("err");
  });
});
