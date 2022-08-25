import "../src";
import { mongoose } from "../src";
import { TestStartup } from "@ipare/testing";

it("should get mongoose by ctx", async () => {
  await new TestStartup()
    .use(async (ctx, next) => {
      mongoose.Mongoose.prototype.createConnection = async () => {
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
    .run();
});
