import { MicroMqttStartup } from "@ipare/micro-mqtt";
import { MicroMqttClient } from "../src";
import { TestMqttOptions } from "@ipare/micro-common/test/utils";

describe("prefix", () => {
  it("should subscribe and publish pattern with prefix", async () => {
    const startup = new MicroMqttStartup(TestMqttOptions).pattern(
      "pt_test_pattern",
      (ctx) => {
        ctx.res.body = ctx.req.body;
        expect(!!ctx.req.packet).toBeTruthy();
      }
    );
    await startup.listen();

    const client = new MicroMqttClient({
      ...TestMqttOptions,
      prefix: "pt_",
      subscribeOptions: { qos: 1 },
      publishOptions: {},
    });
    await client["connect"]();
    const result = await client.send("test_pattern", "test_body");
    console.log("result", result);

    await startup.close(true);
    await client.dispose(true);

    expect(result).toBe("test_body");
  });
});
