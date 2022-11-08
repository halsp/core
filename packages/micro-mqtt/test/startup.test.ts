import { MicroMqttStartup } from "../src";
import { mockConnection } from "../src/mock";

describe("startup", () => {
  it("should be error when the message is invalidate", async () => {
    let pattern: any = undefined;
    let data: any = undefined;
    const startup = new MicroMqttStartup()
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
});
