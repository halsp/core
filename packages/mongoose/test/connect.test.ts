import "../src";
import { TestStartup } from "@halsp/testing";
import { parseInject } from "@halsp/inject";
import { mongoose, Mongoose } from "../src";
import { OPTIONS_IDENTITY } from "../src/constant";

test("connected connection should be destroy", async () => {
  const { ctx } = await new TestStartup()
    .use(async (ctx, next) => {
      (mongoose as any).createConnection = async () => {
        ctx.set("connect", "1");
        return {
          destroy: () => {
            ctx.set("destroy", "1");
          },
          readyState: mongoose.ConnectionStates.connected,
        } as any;
      };
      await next();
    })
    .useMongoose({
      url: "mongodb://test",
    })
    .use(async (ctx) => {
      const connection = await parseInject<Mongoose>(ctx, OPTIONS_IDENTITY);
      if (!connection) throw new Error();
    })
    .run();

  expect(ctx.get("connect")).toBe("1");
  expect(ctx.get("destroy")).toBe("1");
});

it("disconnected connection should not be destroy", async () => {
  const { ctx } = await new TestStartup()
    .use(async (ctx, next) => {
      (mongoose as any).createConnection = async () => {
        ctx.set("connect", "1");
        return {
          destroy: () => {
            ctx.set("destroy", "1");
          },
          readyState: mongoose.ConnectionStates.disconnected,
        } as any;
      };
      await next();
    })
    .useMongoose({
      url: "mongodb://test",
    })
    .use(async (ctx) => {
      const connection = await parseInject<Mongoose>(ctx, OPTIONS_IDENTITY);
      if (!connection) throw new Error();
    })
    .run();

  expect(ctx.get("connect")).toBe("1");
  expect(ctx.get("destroy")).toBeUndefined();
});
