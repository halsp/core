import { MicroMqttStartup } from "../src";
import { createMock } from "@ipare/testing/dist/micro-mqtt";
import { MicroMqttClient } from "@ipare/micro-client";

describe("startup", () => {
  jest.mock("mqtt", () => createMock());

  it("should subscribe and publish", async () => {
    const startup = new MicroMqttStartup({
      subscribeOptions: { qos: 1 },
      publishOptions: {},
    }).patterns({
      pattern: "test_pattern_subscribe",
      handler: (ctx) => {
        ctx.res.body = ctx.req.body;
      },
    });
    await startup.listen();

    const client = new MicroMqttClient();
    await client.connect();
    const result = await client.send("test_pattern_subscribe", "test_body");

    await startup.close();
    await client.dispose();

    expect(result.data).toBe("test_body");
    expect(result.error).toBeUndefined();
  });

  it("should subscribe wiehout publish when pattern is not matched", async () => {
    const startup = new MicroMqttStartup({
      subscribeOptions: { qos: 1 },
      publishOptions: {},
    }).patterns({
      pattern: "test_pattern_not_matched",
      handler: (ctx) => {
        ctx.res.body = ctx.req.body;
      },
    });
    await startup.listen();

    const client = new MicroMqttClient();
    await client.connect();
    const result = await client.send("test_pattern_not_matched1", "test_body");

    await startup.close();
    await client.dispose();

    expect(result.data).toBe("test_body");
    expect(result.error).toBeUndefined();
  });

  it("should log error if client emit error event", async () => {
    const startup = new MicroMqttStartup();
    await startup.listen();

    let error: any;
    const consoleError = console.error;
    console.error = (err) => {
      error = err;
    };
    startup["client"]?.emit("error", new Error("err"));
    console.error = consoleError;

    expect(error.message).toBe("err");
  });
});
