import "../src";
import { Middleware, ILogger, Startup } from "@halsp/core";
import { Logger } from "../src";
import { CustomTransport } from "./utils";
import "@halsp/testing";
import { InjectType } from "@halsp/inject";
import winston from "winston";

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
    await new Startup()
      .useLogger({
        transports: [new CustomTransport(buffer)],
      })
      .add(TestMiddleware)
      .test();

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
    await new Startup()
      .useLogger()
      .useLogger("abc")
      .use(async (ctx) => {
        expect(!!(await ctx.getLogger())).toBeTruthy();
        expect(!!(await ctx.getLogger("abc"))).toBeTruthy();
        expect(!!(await ctx.getLogger("def"))).toBeFalsy();
      })
      .test();
  });
});

describe("use", () => {
  class TestMiddleware extends Middleware {
    @Logger()
    private readonly testLogger!: ILogger;

    @Logger("2")
    private readonly testLogger2!: ILogger;

    async invoke(): Promise<void> {
      this.ctx.set("RESULT", this.testLogger?.transports);
      this.ctx.set("LOGGER2", this.testLogger2);
    }
  }

  it("should use console from useConsoleLogger", async () => {
    const { ctx } = await new Startup()
      .useConsoleLogger()
      .add(TestMiddleware)
      .test();

    expect(
      ctx.get<winston.transport[]>("RESULT")[0] instanceof
        winston.transports.Console
    ).toBeTruthy();
  });

  it("should use file from useFileLogger", async () => {
    const { ctx } = await new Startup()
      .useFileLogger({
        fileTransportOptions: {
          filename: "node_modules/test.logger.log",
        },
      })
      .add(TestMiddleware)
      .test();

    expect(
      ctx.get<winston.transport[]>("RESULT")[0] instanceof
        winston.transports.File
    ).toBeTruthy();
  });

  it("should be dispose after request when injectType is scoped", async () => {
    const { ctx } = await new Startup()
      .useConsoleLogger("2", {
        injectType: InjectType.Scoped,
      })
      .add(TestMiddleware)
      .test();

    expect(ctx.get<Logger>("LOGGER2").destroyed).toBeTruthy();
  });

  it("should be singleton after request when injectType is scoped", async () => {
    const { ctx } = await new Startup()
      .useConsoleLogger({
        injectType: InjectType.Scoped,
      } as any)
      .add(TestMiddleware)
      .test();

    expect((ctx.logger as Logger).destroyed).toBeFalsy();
  });
});
