import "../src";
import { Middleware } from "@ipare/core";
import { Logger, LoggerInject, winston } from "../src";
import { CustomTransport } from "./utils";
import { TestStartup } from "@ipare/testing";

describe("identity", () => {
  class TestMiddleware extends Middleware {
    @LoggerInject("app")
    private readonly appLogger!: Logger;
    @LoggerInject("core")
    private readonly coreLogger!: Logger;

    async invoke(): Promise<void> {
      this.appLogger.info("info");
      this.coreLogger.error("error");
    }
  }

  it("should define logger with identity", async () => {
    const appBuffer = [];
    const coreBuffer = [];
    await new TestStartup()
      .useLogger("app", {
        transports: [new CustomTransport(appBuffer)],
      })
      .useLogger("core", {
        transports: [new CustomTransport(coreBuffer)],
      })
      .add(TestMiddleware)
      .run();

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    const app = appBuffer[0] as any;
    const core = coreBuffer[0] as any;
    expect({ level: app.level, message: app.message }).toEqual({
      level: "info",
      message: "info",
    });
    expect({ level: core.level, message: core.message }).toEqual({
      level: "error",
      message: "error",
    });
  });

  it("should define logger with identity by useConsoleLogger", async () => {
    class TestMiddleware extends Middleware {
      @LoggerInject("testid")
      private readonly logger!: Logger;

      async invoke(): Promise<void> {
        this.ctx.bag("RESULT", this.logger.transports);
      }
    }

    const { ctx } = await new TestStartup()
      .useConsoleLogger("testid")
      .add(TestMiddleware)
      .run();

    expect(
      ctx.bag<winston.transport[]>("RESULT")[0] instanceof
        winston.transports.Console
    ).toBeTruthy();
  });
});
