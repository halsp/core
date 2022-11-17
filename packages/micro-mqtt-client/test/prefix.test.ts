import { MicroMqttStartup } from "@ipare/micro-mqtt";
import { createMock } from "@ipare/testing/dist/micro-mqtt";
import { MicroMqttClient } from "../src";

describe("prefix", () => {
  jest.mock("mqtt", () => createMock());

  it("should subscribe and publish pattern with prefix", async () => {
    const startup = new MicroMqttStartup({
      prefix: "pt_",
    }).pattern("test_pattern", (ctx) => {
      ctx.res.body = ctx.req.body;
      expect(!!ctx.req.packet).toBeTruthy();
    });
    await startup.listen();

    const client = new MicroMqttClient({
      prefix: "pt_",
      subscribeOptions: { qos: 1 },
      publishOptions: {},
    });
    await client.connect();
    const result = await client.send("test_pattern", "test_body");

    await startup.close();
    await client.dispose();

    expect(result.data).toBe("test_body");
    expect(result.error).toBeUndefined();
  });
});
