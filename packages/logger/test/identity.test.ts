import "../src";
import { Middleware } from "@ipare/core";
import { Logger } from "../src";
import winston from "winston";
import { CustomTransport } from "./utils";
import { TestStartup } from "@ipare/testing";

class TestMiddleware extends Middleware {
  @Logger("app")
  private readonly appLogger!: winston.Logger;
  @Logger("core")
  private readonly coreLogger!: winston.Logger;

  async invoke(): Promise<void> {
    this.appLogger.info("info");
    this.coreLogger.error("error");
  }
}

test("logger", async () => {
  const appBuffer = [];
  const coreBuffer = [];
  await new TestStartup()
    .useLogger({
      identity: "app",
      transports: [new CustomTransport(appBuffer)],
    })
    .useLogger({
      identity: "core",
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
