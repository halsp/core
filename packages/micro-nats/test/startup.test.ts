import { MicroNatsClient, MicroNatsStartup } from "../src";
import { mockConnection, mockConnectionFrom } from "../src/mock";

describe("startup", () => {
  it("should be error when the message is invalidate", async () => {
    let pattern: any = undefined;
    let data: any = undefined;
    const startup = new MicroNatsStartup()
      .use(async (ctx) => {
        pattern = ctx.req.pattern;
        data = ctx.req.body;
        expect(ctx.bag("pt")).toBeTruthy();
      })
      .patterns({
        pattern: "test_invalidate",
        handler: (ctx) => {
          ctx.bag("pt", true);
        },
      });
    mockConnection.bind(startup)();
    const connect = await startup.listen();

    connect?.publish("test_invalidate", Buffer.from(`3#{}`, "utf-8"));

    let times = 0;
    while (times < 20 && !pattern) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      times++;
    }

    await startup.close();
    expect(pattern).toBeUndefined();
    expect(data).toBeUndefined();
  });

  it("should publish and return value", async () => {
    const startup = new MicroNatsStartup()
      .use((ctx) => {
        ctx.res.setBody(ctx.req.body);
        expect(ctx.bag("pt")).toBeTruthy();
      })
      .pattern("test_return", (ctx) => {
        ctx.bag("pt", true);
      });
    mockConnection.bind(startup)();
    await startup.listen();

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        resolve();
      }, 500);
    });

    const client = new MicroNatsClient();
    mockConnectionFrom.bind(client)(startup);
    await client.connect();

    (startup as any).pub = undefined;

    const waitResult = await new Promise<boolean>(async (resolve) => {
      setTimeout(() => {
        resolve(false);
      }, 2000);
      const result = await client.send("test_return", "abc");
      expect(result).toBe("abc");
      setTimeout(async () => {
        resolve(true);
      }, 500);
    });

    await startup.close();
    await client.dispose();

    expect(waitResult).toBeTruthy();
  }, 10000);
});
