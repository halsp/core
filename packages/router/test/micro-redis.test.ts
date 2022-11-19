import {
  createMock,
  TestMicroRedisStartup,
} from "@ipare/testing/dist/micro-redis";
import "./utils-micro";
import { MicroRedisClient } from "@ipare/micro-redis-client";

describe("micro-redis", () => {
  jest.mock("redis", () => createMock());

  it("should add pattern handlers when use micro redis", async () => {
    const startup = new TestMicroRedisStartup().useTestRouter().useRouter();
    await startup.listen();

    const client = new MicroRedisClient();
    await client.connect();

    const result = await client.send("event:123", true);

    await startup.close();
    await client.dispose();

    expect(result.data).toBe("event-pattern-test");
  });

  it("should match pattern with prefix", async () => {
    const startup = new TestMicroRedisStartup()
      .useTestRouter({
        prefix: "pf:",
      })
      .useRouter();
    startup.listen();

    const client = new MicroRedisClient();
    await client.connect();

    const result = await client.send("pf:event:123", true);

    await startup.close();
    await client.dispose();

    expect(result.data).toBe("event-pattern-test");
  });
});
