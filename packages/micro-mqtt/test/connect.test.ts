import { TestMqttOptions } from "@ipare/micro-common/test/utils";
import { MicroMqttStartup } from "../src";

describe("connect", () => {
  it("should connect with default port", async () => {
    const startup = new MicroMqttStartup({
      host: TestMqttOptions.host,
      port: undefined,
    });
    await startup.listen();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await startup.close(true);
  });

  it("should connect with servers", async () => {
    const startup = new MicroMqttStartup({
      servers: [TestMqttOptions],
    });
    await startup.listen();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    await startup.close(true);
  });
});
