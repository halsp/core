import { MicroMqttStartup } from "@ipare/micro-mqtt";
import { MicroMqttClient } from "../src";
import { TestMqttOptions } from "@ipare/micro-common/test/utils";

describe("error", () => {
  it("should log error if client emit error event", async () => {
    const client = new MicroMqttClient();
    await client["connect"]();

    let error: any;
    client.logger = {
      error: (err: any) => {
        error = err;
      },
    } as any;

    client["client"]?.emit("error", new Error("err"));

    expect(error.message).toBe("err");
  });

  it("should ignore error if logger is undefined", async () => {
    const client = new MicroMqttClient();
    await client["connect"]();
    client.logger = undefined as any;

    client["client"]?.emit("error", new Error("err"));
  });

  it("should throw error when result.error is defined", async () => {
    const startup = new MicroMqttStartup(TestMqttOptions)
      .pattern("test_pattern", () => undefined)
      .use((ctx) => {
        ctx.res.setError("err");
      });
    await startup.listen();

    const client = new MicroMqttClient(TestMqttOptions);
    await client["connect"]();

    let error: any;
    try {
      await client.send("test_pattern", "test_body");
    } catch (err) {
      error = err;
    }

    await startup.close(true);
    await client.dispose(true);

    expect(error.message).toBe("err");
  }, 10000);
});
