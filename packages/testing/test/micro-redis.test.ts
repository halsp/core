import {
  createMock,
  mockPkgName,
  TestMicroRedisStartup,
} from "../src/micro-redis";
import { MicroRedisClient } from "@ipare/micro-redis-client";

describe("micro-redis", () => {
  jest.mock(mockPkgName, () => createMock());

  it("should subscribe and publish", async () => {
    const startup = new TestMicroRedisStartup({
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
    expect(result.data).toBe("test_body");

    await client.dispose();
    await startup.close();
  });

  it("should create new mock client", async () => {
    const client1 = createMock();
    expect(client1.createClient()).toBe(client1.createClient());

    const client2 = createMock(false);
    expect(client2.createClient()).not.toBe(client2.createClient());
  });

  it("should not mock packate when IS_LOCAL_TEST is true", () => {
    process.env.IS_LOCAL_TEST = "true";
    expect(mockPkgName).toBe("jest");
    process.env.IS_LOCAL_TEST = "";
  });

  it("should mock packate when IS_LOCAL_TEST is undefined", () => {
    process.env.IS_LOCAL_TEST = "";
    expect(mockPkgName).toBe("redis");
  });
});
