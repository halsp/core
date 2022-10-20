import { Middleware } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { LoggerInject, Logger, winston } from "../src";
import "../src";

class TestMiddleware extends Middleware {
  @LoggerInject()
  private readonly logger!: Logger;

  async invoke(): Promise<void> {
    this.ctx.bag("RESULT", this.logger.transports);
  }
}

test("useConsoleLogger", async () => {
  const { ctx } = await new TestStartup()
    .useConsoleLogger()
    .add(TestMiddleware)
    .run();

  expect(
    ctx.bag<winston.transport[]>("RESULT")[0] instanceof
      winston.transports.Console
  ).toBeTruthy();
});

test("useFileLogger", async () => {
  const { ctx } = await new TestStartup()
    .useFileLogger({
      fileTransportOptions: {
        filename: "node_modules/test.logger.log",
      },
    })
    .add(TestMiddleware)
    .run();

  expect(
    ctx.bag<winston.transport[]>("RESULT")[0] instanceof winston.transports.File
  ).toBeTruthy();
});
