import { MicroMqttStartup } from "../src";
import { createMock, mockPkgName } from "@ipare/testing/dist/micro-mqtt";
import { MicroMqttClient } from "@ipare/micro-client";

describe("prefix", () => {
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

    await startup.close();
    await client.dispose();

    expect(result.data).toBe("test_body");
    expect(result.error).toBeUndefined();
  });
});
