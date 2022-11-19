import { MicroRedisClient } from "@ipare/micro-redis-client";
import { createMock, mockPkgName } from "@ipare/testing/dist/micro-redis";
import { MicroRedisStartup } from "../src";

describe("mock", () => {
  jest.mock(mockPkgName, () => createMock());

  it("should subscribe and publish when use mock", async () => {
    const startup = new MicroRedisStartup({
      password: "H",
    }).pattern("test_pattern", (ctx) => {
      ctx.res.body = ctx.req.body;
    });
    await startup.listen();

    const client = new MicroRedisClient({
      password: "H",
    });
    await client.connect();
    const result = await client.send("test_pattern", "test_body");

    await client.dispose();
    await startup.close();

    expect(result).toEqual({
      data: "test_body",
      error: undefined,
    });
  });
});
