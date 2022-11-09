import { MicroMqttClient, MicroMqttStartup } from "../src";
import { mockConnection, mockConnectionFrom } from "../src/mock";
import { localTest, runSendTest } from "./utils";

describe("startup", () => {
  it("should be error when the message is invalidate", async () => {
    let pattern: any = undefined;
    let data: any = undefined;
    const startup = new MicroMqttStartup()
      .use(async (ctx) => {
        pattern = ctx.req.pattern;
        data = ctx.req.body;
        expect(ctx.bag("pt")).toBeTruthy();
        expect(!!ctx.req.packet).toBeTruthy();
      })
      .patterns({
        pattern: "test_invalidate",
        handler: (ctx) => {
          ctx.bag("pt", true);
        },
      });
    mockConnection.bind(startup)();
    const connect = await startup.listen();

    const beforeError = console.error;
    let err = false;
    console.error = () => {
      err = true;
    };
    connect?.publish("test_invalidate", Buffer.from(`3#{}`, "utf-8"));

    let times = 0;
    while (times < 20 && !pattern) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      times++;
    }

    console.error = beforeError;

    await startup.close();
    expect(err).toBeTruthy();
    expect(pattern).toBeUndefined();
    expect(data).toBeUndefined();
  });

  it("should publish with publishOptions", async () => {
    const result = await runSendTest(
      true,
      (ctx) => {
        ctx.res.setBody(ctx.req.body);
        expect(ctx.req.packet).toBe(ctx.req.path);
      },
      {
        publishOptions: {
          qos: 1,
        },
      },
      undefined,
      true
    );
    expect(result.data).toBe(true);
  });

  it("should subscribe with subscribeOptions", async () => {
    const result = await runSendTest(
      true,
      (ctx) => {
        ctx.res.setBody(ctx.req.body);
      },
      {
        subscribeOptions: {
          qos: 1,
        },
      },
      undefined,
      true
    );
    expect(result.data).toBe(true);
  });
});

describe("pattern", () => {
  async function testPattern(pattern: string, topic: string) {
    const startup = new MicroMqttStartup()
      .use(async (ctx) => {
        ctx.res.body = ctx.req.body;
        // expect(ctx.req.pattern).toBe(topic);
      })
      .patterns({
        pattern: pattern,
        handler: () => undefined,
      });
    if (!localTest) {
      mockConnection.bind(startup)();
    }
    await startup.listen();

    const client = new MicroMqttClient();
    if (!localTest) {
      mockConnectionFrom.bind(client)(startup);
    }
    await client.connect();

    const result = await client.send(topic, "123");

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    await client.dispose();
    await startup.close();

    expect(result.data).toBe("123");
  }

  it("should match topic with #", async () => {
    await testPattern("test/#", "test/abc");
    await testPattern("test/#", "test/abc/def");
  });

  it("should match topic with +", async () => {
    await testPattern("test/+/ab", "test/123/ab");
    await testPattern("+/ab", "123/ab");
  });
});
