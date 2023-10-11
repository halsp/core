import { Context, Request, Startup } from "../src";
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
    res = await startup.run(new Request());
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

    startup.logger = logger;
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

describe("extend", () => {
  it("should invoke extend functions on by on", async () => {
    let times = 0;
    const startup = new Startup();
    startup.extend("testExtend" as any, () => {
      times++;
    });
    startup.extend("testExtend" as any, () => {
      times++;
    });
    startup.extend("testExtend" as any, () => {
      times++;
    });
    startup["testExtend"]();
    expect(times).toBe(3);
  });

  it("should return last result", async () => {
    const startup = new Startup();
    startup.extend("testExtend" as any, () => {
      return "test1";
    });
    startup.extend("testExtend" as any, () => {
      return "test2";
    });
    startup.extend("testExtend" as any, () => {
      return undefined;
    });
    const result = startup["testExtend"]();
    expect(result).toBe("test2");
  });

  it("should return promise result", async () => {
    const startup = new Startup();
    startup.extend("testExtend" as any, async () => {
      return "test1";
    });
    startup.extend("testExtend" as any, async () => {
      return "test2";
    });
    startup.extend("testExtend" as any, async () => {
      return undefined;
    });
    const result = await startup["testExtend"]();
    expect(result).toBe("test2");
  });

  it("should return promise and normal result", async () => {
    const startup = new Startup();
    startup.extend("testExtend" as any, async () => {
      return "test1";
    });
    startup.extend("testExtend" as any, () => {
      return "test2";
    });
    startup.extend("testExtend" as any, () => {
      return undefined;
    });
    const result = await startup["testExtend"]();
    expect(result).toBe("test2");
  });

  it("should throw error", async () => {
    const startup = new Startup();
    startup.extend("testExtend" as any, async () => {
      throw new Error("err1");
    });
    startup.extend("testExtend" as any, async () => {
      throw new Error("err2");
    });
    try {
      await startup["testExtend"]();
      expect(true).toBeFalsy();
    } catch (err) {
      expect((err as Error).message).toBe("err1");
    }
  });
});

describe("call", () => {
  async function testWhen(val: boolean) {
    const { ctx } = await new Startup()
      .call(
        () => val,
        (_) =>
          _.use(async (ctx, next) => {
            ctx.set("test", true);
            await next();
          }),
      )

      .run();

    expect(ctx.get("test")).toBe(val ? true : undefined);
  }

  it("should exec when matched", async () => {
    await testWhen(true);
  });

  it("should not exec when not matched", async () => {
    await testWhen(false);
  });
});

describe("register", () => {
  it("should register handler", async () => {
    const { ctx } = await new Startup()
      .register("test1", (ctx) => {
        ctx.set("test1", true);
      })
      .register("test2", (ctx) => {
        ctx.set("test2", true);
      })
      .use(async (ctx, next) => {
        for (const item of ctx.startup.registers) {
          await item.handler?.call(item, ctx);
        }
        await next();
      })
      .run();

    expect(ctx.get("test1")).toBeTruthy();
    expect(ctx.get("test2")).toBeTruthy();
  });
});
