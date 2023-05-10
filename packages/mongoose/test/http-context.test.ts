import "../src";
import mongoose from "mongoose";
import "@halsp/testing";
import { Startup } from "@halsp/core";

it("should get mongoose by ctx", async () => {
  await new Startup()
    .use(async (ctx, next) => {
      (mongoose as any).createConnection = async () => {
        return {
          close: () => undefined,
        } as any;
      };
      await next();
    })
    .useMongoose({
      url: "test",
      identity: "abc",
    })
    .useMongoose({
      url: "test",
    })
    .use(async (ctx, next) => {
      expect(!!(await ctx.getMongoose())).toBeTruthy();
      expect(!!(await ctx.getMongoose("abc"))).toBeTruthy();
      expect(!!(await ctx.getMongoose("def"))).toBeFalsy();

      await next();
    })
    .test();
});
