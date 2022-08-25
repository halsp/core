import "../src";
import { Middleware } from "@ipare/core";
import { Logger } from "../src";
import winston from "winston";
import { CustomTransport } from "./utils";
import { TestStartup } from "@ipare/testing";

class TestMiddleware extends Middleware {
  @Logger()
  private readonly logger!: winston.Logger;

  async invoke(): Promise<void> {
    this.logger.info("info");
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
    expect({ level: obj.level, message: obj.message }).toEqual({
      level: "info",
      message: "info",
    });
  });

  it("should get logger from ctx", async () => {
    await new TestStartup()
      .useLogger()
      .useLogger({
        identity: "abc",
      })
      .use(async (ctx) => {
        expect(!!(await ctx.getLogger())).toBeTruthy();
        expect(!!(await ctx.getLogger("abc"))).toBeTruthy();
        expect(!!(await ctx.getLogger("def"))).toBeFalsy();
      })
      .run();
  });
});
