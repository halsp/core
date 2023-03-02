import { TestMicroRedisStartup } from "@halsp/testing/dist/micro-redis";
import "./utils-micro";
import { MicroRedisClient } from "@halsp/micro-redis-client";

describe("micro-redis", () => {
  it("should add pattern handlers when use micro redis", async () => {
    const startup = new TestMicroRedisStartup({
      url: "redis://127.0.0.1:6003",
    })
      .useTestRouter()
      .useRouter();
    await startup.listen();

    const client = new MicroRedisClient({
      url: "redis://127.0.0.1:6003",
    });
    await client["connect"]();

    const result = await client.send("event:123", true);

    await startup.close();
    await client.dispose();

    expect(result).toBe("event-pattern-test");
  });

  it("should match pattern with prefix", async () => {
    const startup = new TestMicroRedisStartup({
      url: "redis://127.0.0.1:6003",
    })
      .useTestRouter({
        prefix: "pf:",
      })
      .useRouter();
    await startup.listen();

    const client = new MicroRedisClient({
      url: "redis://127.0.0.1:6003",
      prefix: "pf:",
    });
    await client["connect"]();

    const result = await client.send("event:123", true);

    await startup.close();
    await client.dispose();

    expect(result).toBe("event-pattern-test");
  });
});
