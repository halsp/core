import { MicroMqttStartup } from "../src";
import { MicroMqttClient } from "@ipare/micro-client";

describe("prefix", () => {
  // prevent loop type check
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createMock, mockPkgName } = require("@ipare/testing/dist/micro-mqtt");
  jest.mock(mockPkgName, () => createMock());

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
    });
    await client.connect();
    const result = await client.send("test_pattern", "test_body");

    await startup.close(true);
    await client.dispose(true);

    expect(result.data).toBe("test_body");
    expect(result.error).toBeUndefined();
  });
});
