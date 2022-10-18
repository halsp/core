import "../src";
import { TestStartup } from "@ipare/testing";
import { parseInject } from "@ipare/inject";
import { mongoose, MongooseConnection } from "../src";
import { OPTIONS_IDENTITY } from "../src/constant";

test("connected connection should be destroy", async () => {
  const { ctx } = await new TestStartup()
    .use(async (ctx, next) => {
      (mongoose as any).createConnection = async () => {
        ctx.bag("connect", "1");
        return {
          destroy: () => {
            ctx.bag("destroy", "1");
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
      const connection = await parseInject<MongooseConnection>(
        ctx,
        OPTIONS_IDENTITY
      );
      if (!connection) throw new Error();
    })
    .run();

  expect(ctx.bag("connect")).toBe("1");
  expect(ctx.bag("destroy")).toBe("1");
});

it("disconnected connection should not be destroy", async () => {
  const { ctx } = await new TestStartup()
    .use(async (ctx, next) => {
      (mongoose as any).createConnection = async () => {
        ctx.bag("connect", "1");
        return {
          destroy: () => {
            ctx.bag("destroy", "1");
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
      const connection = await parseInject<MongooseConnection>(
        ctx,
        OPTIONS_IDENTITY
      );
      if (!connection) throw new Error();
    })
    .run();

  expect(ctx.bag("connect")).toBe("1");
  expect(ctx.bag("destroy")).toBeUndefined();
});
