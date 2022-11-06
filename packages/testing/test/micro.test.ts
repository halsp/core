import { Request, Response } from "@ipare/core";
import { TestMicroStartup } from "../src/micro";
import { TestMicroTcpClient, TestMicroTcpStartup } from "../src/micro-tcp";
import {
  TestMicroRedisStartup,
  TestMicroRedisClient,
} from "../src/micro-redis";
import { TestMicroNatsStartup, TestMicroNatsClient } from "../src/micro-nats";

describe("micro response.expect", () => {
  it("should expect body", async () => {
    new Response()
      .setBody({
        a: 1,
      })
      .expect(undefined, {
        a: 1,
      });
  });
});

describe("micro startup", () => {
  it("default body is undefined", async () => {
    await new TestMicroStartup().expect((res) => {
      res.expect(undefined);
    });
  });

  it("should set res.body ok", async () => {
    await new TestMicroStartup()
      .use((ctx) => {
        ctx.res.setBody("ok");
      })
      .expect((res) => {
        res.expect((res) => {
          expect(res.body).toBe("ok");
        });
      });
  });

  it("shound set res.body if skip throw error", async () => {
    await new TestMicroStartup()
      .setSkipThrow()
      .setContext(new Request())
      .use(() => {
        throw new Error("err");
      })
      .expect((res) => {
        expect(res.body).toBeUndefined();
        expect(res.status).toBe("error");
        expect(res.error).toBe("err");
      });
  });

  it("should throw error", async () => {
    const startup = new TestMicroStartup().use(() => {
      throw new Error("err");
    });

    let err = false;
    try {
      await startup.run();
    } catch {
      err = true;
    }
    expect(err).toBeTruthy();
  });
});

describe("micro tcp startup", () => {
  it("should send message and return boolean value", async () => {
    const startup = new TestMicroTcpStartup({
      port: 23334,
    }).use((ctx) => {
      ctx.res.setBody(ctx.req.body);
    });
    const { port } = await startup.dynamicListen();

    const client = new TestMicroTcpClient({
      port,
    });
    await client.connect();
    const result = await client.send("", true);
    await startup.close();
    client.dispose();

    expect(result).toBe(true);
  });
});

describe("micro redis startup", () => {
  it("should create mock redis", async () => {
    const startup = new TestMicroRedisStartup().mockConnection();
    await startup.listen();

    const client = new TestMicroRedisClient().mockConnection();
    await client.connect();

    expect(!!(startup as any).pub).toBeTruthy();
    expect((startup as any).sub).toBe((startup as any).pub);
    expect(!!(client as any).pub).toBeTruthy();
    expect((client as any).sub).toBe((client as any).pub);

    await startup.close();
    await client.dispose();
  });

  it("should create startup mock from startup", async () => {
    const startup1 = new TestMicroRedisStartup().mockConnection();
    await startup1.listen();

    const startup2 = new TestMicroRedisStartup().mockConnectionFrom(startup1);
    await startup2.listen();

    expect((startup2 as any).sub).toBe((startup2 as any).pub);
    expect((startup1 as any).sub).toBe((startup1 as any).pub);
    expect((startup2 as any).pub).toBe((startup1 as any).pub);
    expect((startup2 as any).sub).toBe((startup1 as any).sub);

    await startup1.close();
    await startup2.close();
  });

  it("should send message and return boolean value", async () => {
    const startup = new TestMicroRedisStartup()
      .mockConnection()
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
        expect(ctx.bag("pt")).toBeTruthy();
      })
      .pattern("test_return", (ctx) => {
        ctx.bag("pt", true);
      });
    await startup.listen();

    const client = new TestMicroRedisClient().mockConnectionFrom(startup);
    await client.connect();

    const result = await client.send("test_return", true);

    await startup.close();
    await client.dispose();

    expect(result).toBe(true);
  });
});

describe("micro nats startup", () => {
  it("should create mock redis", async () => {
    const startup = new TestMicroNatsStartup().mockConnection();
    await startup.listen();

    const client = new TestMicroNatsClient().mockConnection();
    await client.connect();

    expect(!!(startup as any).connection).toBeTruthy();
    expect(!!(client as any).connection).toBeTruthy();

    await startup.close();
    await client.dispose();
  });

  it("should create startup mock from startup", async () => {
    const startup1 = new TestMicroNatsStartup().mockConnection();
    await startup1.listen();

    const startup2 = new TestMicroNatsStartup().mockConnectionFrom(startup1);
    await startup2.listen();

    expect((startup2 as any).connection).toBe((startup1 as any).connection);

    await startup1.close();
    await startup2.close();
  });

  it("should send message and return boolean value", async () => {
    const startup = new TestMicroNatsStartup()
      .mockConnection()
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
        expect(ctx.bag("pt")).toBeTruthy();
      })
      .pattern("test_return", (ctx) => {
        ctx.bag("pt", true);
      });
    await startup.listen();

    const client = new TestMicroNatsClient().mockConnectionFrom(startup);
    await client.connect();

    const result = await client.send("test_return", true);

    await startup.close();
    await client.dispose();

    expect(result).toBe(true);
  });
});
