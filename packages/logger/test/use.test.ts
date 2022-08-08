import { Middleware } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { Logger, winston } from "../src";
import "../src";

class TestMiddleware extends Middleware {
  @Logger()
  private readonly logger!: winston.Logger;

  async invoke(): Promise<void> {
    this.ctx.res["RESULT"] = this.logger.transports;
  }
}

test("useConsoleLogger", async () => {
  const res = await new TestStartup()
    .useConsoleLogger()
    .add(TestMiddleware)
    .run();

  expect(res["RESULT"][0] instanceof winston.transports.Console).toBeTruthy();
});

test("useFileLogger", async () => {
  const res = await new TestStartup()
    .useFileLogger({
      fileTransportOptions: {
        filename: "node_modules/test.logger.log",
      },
    })
    .add(TestMiddleware)
    .run();

  expect(res["RESULT"][0] instanceof winston.transports.File).toBeTruthy();
});
