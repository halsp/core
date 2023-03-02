import "../src";
import { Middleware, ILogger } from "@halsp/common";
import { Logger, winston } from "../src";
import { CustomTransport } from "./utils";
import { TestStartup } from "@halsp/testing";
import { InjectType } from "@halsp/inject";

class TestMiddleware extends Middleware {
  @Logger()
  private readonly testLogger!: ILogger;

  async invoke(): Promise<void> {
    this.testLogger.info("info");
  }
}

describe("logger", () => {
  it("should log info", async () => {
    const buffer = [];
    await new TestStartup()
      .useLogger({
        transports: [new CustomTransport(buffer)],
      })
      .add(TestMiddleware)
      .run();

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    const obj = buffer[0] as any;
    expect(obj.level).toBe("info");
    expect(obj.message).toBe("info");
  });

  it("should get logger by ctx", async () => {
    await new TestStartup()
      .useLogger()
      .useLogger("abc")
      .use(async (ctx) => {
        expect(!!(await ctx.getLogger())).toBeTruthy();
        expect(!!(await ctx.getLogger("abc"))).toBeTruthy();
        expect(!!(await ctx.getLogger("def"))).toBeFalsy();
      })
      .run();
  });
});

describe("use", () => {
  class TestMiddleware extends Middleware {
    @Logger()
    private readonly testLogger!: ILogger;

    async invoke(): Promise<void> {
      this.ctx.set("RESULT", this.testLogger.transports);
    }
  }

  it("should use console from useConsoleLogger", async () => {
    const { ctx } = await new TestStartup()
      .useConsoleLogger()
      .add(TestMiddleware)
      .run();

    expect(
      ctx.get<winston.transport[]>("RESULT")[0] instanceof
        winston.transports.Console
    ).toBeTruthy();
  });

  it("should use file from useFileLogger", async () => {
    const { ctx } = await new TestStartup()
      .useFileLogger({
        fileTransportOptions: {
          filename: "node_modules/test.logger.log",
        },
      })
      .add(TestMiddleware)
      .run();

    expect(
      ctx.get<winston.transport[]>("RESULT")[0] instanceof
        winston.transports.File
    ).toBeTruthy();
  });

  it("should be dispose after request when injectType is scoped", async () => {
    const { ctx } = await new TestStartup()
      .useConsoleLogger({
        injectType: InjectType.Scoped,
      })
      .add(TestMiddleware)
      .run();

    expect((ctx.logger as winston.Logger).destroyed).toBeTruthy();
  });
});
