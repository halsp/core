import { Context, Startup } from "../src";
import { BaseLogger } from "../src/logger";
import "./test-startup";

describe("invoke", () => {
  it("should invoke multiple", async () => {
    const startup = new Startup()
      .use(async (ctx, next) => {
        if (!ctx.has("result")) {
          ctx.set("result", 0);
        }
        ctx.set("result", ctx.get<number>("result") + 1);
        await next();
      })
      .use(async (ctx) => {
        ctx.set("result", ctx.get<number>("result") + 1);
      });
    process.env.NODE_ENV = "";

    let res = await startup.run(new Context());
    expect(res.ctx.get("result")).toBe(2);
    res = await startup.run();
    expect(res.ctx.get("result")).toBe(2);
    res = await startup.run();
    expect(res.ctx.get("result")).toBe(2);
  });
});

describe("simple", () => {
  it("should invoke simple startup", async () => {
    let context!: Context;
    await new Startup()
      .use(async (ctx) => {
        context = ctx;
      })
      .run();

    expect(context).not.toBeUndefined();
  });

  test("should invoke without md", async () => {
    const ctx = await new Startup().run();

    expect(ctx).not.toBeUndefined();
  });
});

describe("logger", () => {
  it("should set logger", async () => {
    const logger = new BaseLogger();
    const startup = new Startup();
    expect(!!startup.logger).toBeTruthy();

    startup.setLogger(logger);
    expect(startup.logger).toBe(logger);
  });

  it("should set ctx.logger", async () => {
    const startup = new Startup();
    await startup
      .use(async (ctx) => {
        expect(startup.logger).toBe(ctx.logger);
        ctx.logger = {} as any;
        expect(startup.logger).toBe(ctx.logger);
      })
      .run();
  });

  function testConsole(consoleFunc: string) {
    it(`should log ${consoleFunc} by console.${consoleFunc}`, async () => {
      const startup = new Startup();
      const logger = startup.logger;

      const beforeFunc = console[consoleFunc];
      let message = "";
      console[consoleFunc] = (msg: string) => {
        message = msg;
      };
      logger[consoleFunc]("test");
      console[consoleFunc] = beforeFunc;
      expect(message).toBe("test");
    });
  }
  testConsole("error");
  testConsole("warn");
  testConsole("info");
  testConsole("debug");
});
