import { MicroMqttStartup } from "../src";
import { MicroMqttClient } from "@ipare/micro-client";

describe("startup", () => {
  // prevent loop type check
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createMock, mockPkgName } = require("@ipare/testing/dist/micro-mqtt");
  jest.mock(mockPkgName, () => createMock());

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

    await startup.close(true);
    await client.dispose(true);

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
    await client.send("test_pattern_not_matched1", "test_body", 1000);

    await startup.close(true);
    await client.dispose(true);
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

    await startup.close(true);
    expect(error.message).toBe("err");
  });
});
