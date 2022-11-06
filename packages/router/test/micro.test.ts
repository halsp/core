import { Request } from "@ipare/core";
import { TestMicroStartup } from "@ipare/testing/dist/micro";
import {
  TestMicroRedisClient,
  TestMicroRedisStartup,
} from "@ipare/testing/dist/micro-redis";
import {
  TestMicroNatsClient,
  TestMicroNatsStartup,
} from "@ipare/testing/dist/micro-nats";
import "./utils-micro";

describe("pattern", () => {
  it("should match pattern by path", async () => {
    const res = await new TestMicroStartup()
      .setContext(new Request().setPath("path"))
      .useTestRouter()
      .useRouter()
      .run();
    expect(res.body).toBe("pattern-path-test");
  });

  it("should match pattern by path and type", async () => {
    const res = await new TestMicroStartup()
      .setContext(new Request().setPath("path2"))
      .useTestRouter()
      .useRouter()
      .run();
    expect(res.body).toBe("pattern-message-path-test");
  });

  it("should be error if pattern is not exist", async () => {
    const res = await new TestMicroStartup()
      .setContext(new Request().setPath("not-exist"))
      .useTestRouter()
      .useRouter()
      .run();
    expect(res.body).toEqual({
      status: "error",
      message: `Can't find the path: not-exist`,
    });
  });

  it("should match all patterns when use multi patterns", async () => {
    async function test(pattern: string) {
      const res = await new TestMicroStartup()
        .setContext(new Request().setPath(pattern))
        .use(async (ctx, next) => {
          await next();
          expect(ctx.actionMetadata.methods).toEqual([]);
        })
        .useTestRouter()
        .useRouter()
        .run();
      expect(res.body).toEqual("multi-pattern-test");
    }
    await test("multi:123");
    await test("multi:456");
  });
});

describe("registry", () => {
  it("should add pattern handlers when use micro redis", async () => {
    const startup = new TestMicroRedisStartup()
      .mockConnection()
      .useTestRouter()
      .useRouter();
    await startup.listen();

    const client = new TestMicroRedisClient().mockConnectionFrom(startup);
    await client.connect();

    const result = await client.send("event:123", true);

    await startup.close();
    await client.dispose();

    expect(result).toBe("event-pattern-test");
  });

  it("should add pattern handlers when use micro nats", async () => {
    const startup = new TestMicroNatsStartup()
      .mockConnection()
      .useTestRouter()
      .useRouter();
    await startup.listen();

    const client = new TestMicroNatsClient().mockConnectionFrom(startup);
    await client.connect();

    const result = await client.send("event:123", true);

    await startup.close();
    await client.dispose();

    expect(result).toBe("event-pattern-test");
  });
});
