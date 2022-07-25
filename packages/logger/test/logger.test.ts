import "../src";
import { Middleware, TestStartup } from "@ipare/core";
import { Logger } from "../src";
import winston from "winston";
import { CustomTransport } from "./utils";

class TestMiddleware extends Middleware {
  @Logger()
  private readonly logger!: winston.Logger;

  async invoke(): Promise<void> {
    this.logger.info("info");
  }
}

test("logger", async () => {
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
  expect({ level: obj.level, message: obj.message }).toEqual({
    level: "info",
    message: "info",
  });
});
