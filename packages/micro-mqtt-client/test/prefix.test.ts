import { MicroMqttStartup } from "@ipare/micro-mqtt";
import { MicroMqttClient } from "../src";

describe("prefix", () => {
  it("should subscribe and publish pattern with prefix", async () => {
    const startup = new MicroMqttStartup({
      port: 6002,
    }).pattern("pt_test_pattern", (ctx) => {
      ctx.res.body = ctx.req.body;
      expect(!!ctx.req.packet).toBeTruthy();
    });
    await startup.listen();

    const client = new MicroMqttClient({
      port: 6002,
      prefix: "pt_",
      subscribeOptions: { qos: 1 },
      publishOptions: {},
    });
    await client["connect"]();
    const result = await client.send("test_pattern", "test_body");

    await client.dispose(true);
    await startup.close(true);

    expect(result).toBe("test_body");
  });
});
