import { MicroMqttStartup } from "../src";
import { MicroMqttClient } from "@ipare/micro-mqtt-client";
import { TestMqttOptions } from "@ipare/micro-common/test/utils";

describe("startup", () => {
  it("should subscribe and publish ", async () => {
    const startup = new MicroMqttStartup(TestMqttOptions).pattern(
      "test_pattern",
      (ctx) => {
        ctx.res.body = ctx.req.body;
        expect(!!ctx.req.packet).toBeTruthy();
      }
    );
    await startup.listen();

    const client = new MicroMqttClient(TestMqttOptions);
    await client["connect"]();
    const result = await client.send("test_pattern", "test_body");

    await startup.close(true);
    await client.dispose(true);

    expect(result).toBe("test_body");
  });

  it("should subscribe and publish with subscribeOptions and publishOptions", async () => {
    const startup = new MicroMqttStartup({
      ...TestMqttOptions,
      subscribeOptions: { qos: 1 },
      publishOptions: {},
    }).patterns({
      pattern: "test_pattern_subscribe",
      handler: (ctx) => {
        ctx.res.body = ctx.req.body;
      },
    });
    await startup.listen();

    const client = new MicroMqttClient(TestMqttOptions);
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
    const startup = new MicroMqttStartup(TestMqttOptions);
    await startup.listen();
    startup["client"]?.subscribe("test_pattern_not_matched");

    const client = new MicroMqttClient(TestMqttOptions);
    await client["connect"]();

    let error: any;
    try {
      await client.send("test_pattern_not_matched", "test_body", 1000);
    } catch (err) {
      error = err;
    }

    await startup.close(true);
    await client.dispose(true);

    expect(error.message).toBe("Send timeout");
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

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await startup.close(true);
    expect(error.message).toBe("err");
  });

  it("should listen with IPARE_DEBUG_PORT", async () => {
    process.env.IPARE_DEBUG_PORT = "18831";
    const startup = new MicroMqttStartup();
    const client = await startup.listen();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await startup.close(true);

    expect(!!client).toBeTruthy();
  });
});
