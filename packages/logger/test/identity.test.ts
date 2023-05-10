import "../src";
import { Middleware, Startup } from "@halsp/core";
import { Logger } from "../src";
import { CustomTransport } from "./utils";
import "@halsp/testing";
import winston from "winston";

describe("identity", () => {
  class TestMiddleware extends Middleware {
    @Logger("app")
    private readonly appLogger!: Logger;
    @Logger("core")
    private readonly coreLogger!: Logger;

    async invoke(): Promise<void> {
      this.appLogger.info("info");
      this.coreLogger.error("error");
    }
  }

  it("should define logger with identity", async () => {
    const appBuffer = [];
    const coreBuffer = [];
    await new Startup()
      .useLogger("app", {
        transports: [new CustomTransport(appBuffer)],
      })
      .useLogger("core", {
        transports: [new CustomTransport(coreBuffer)],
      })
      .add(TestMiddleware)
      .test();

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
      @Logger("testid")
      private readonly testLogger!: Logger;

      async invoke(): Promise<void> {
        this.ctx.set("RESULT", this.testLogger.transports);
      }
    }

    const { ctx } = await new Startup()
      .useConsoleLogger("testid")
      .add(TestMiddleware)
      .test();

    expect(
      ctx.get<winston.transport[]>("RESULT")[0] instanceof
        winston.transports.Console
    ).toBeTruthy();
  });
});
