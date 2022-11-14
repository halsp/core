import { MicroNatsClient } from "@ipare/micro-client";
import { createMock, mockPkgName } from "@ipare/testing/dist/micro-nats";
import { MicroNatsStartup } from "../src";

describe("prefix", () => {
  jest.mock(mockPkgName, () => createMock());

  it("should subscribe and publish pattern with prefix", async () => {
    const startup = new MicroNatsStartup({
      prefix: "pt_",
    }).pattern("test_pattern", (ctx) => {
      ctx.res.body = ctx.req.body;
    });
    await startup.listen();

    const client = new MicroNatsClient({
      prefix: "pt_",
    });
    await client.connect();
    const result = await client.send("test_pattern", "test_body");

    await client.dispose();
    await startup.close();

    expect(result.data).toBe("test_body");
    expect(result.error).toBeUndefined();
  });
});
