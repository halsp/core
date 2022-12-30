import { MicroNatsClient } from "@ipare/micro-nats-client";
import { MicroNatsStartup } from "../src";

describe("mock", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createMock, mockPkgName } = require("@ipare/testing/dist/micro-nats");
  jest.mock(mockPkgName, () => createMock());

  it("should subscribe and publish when use mock", async () => {
    const startup = new MicroNatsStartup().pattern("test_pattern", (ctx) => {
      ctx.res.body = ctx.req.body;
    });
    await startup.listen();

    const client = new MicroNatsClient();
    await client["connect"]();
    const result = await client.send("test_pattern", "test_body");

    await client.dispose();
    await startup.close();

    expect(result.data).toBe("test_body");
    expect(result.error).toBeUndefined();
  });
});
