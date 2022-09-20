import { Context, Startup } from "../src";
import { TestStartup } from "./test-startup";

describe("invoke", () => {
  it("should invoke multiple", async () => {
    const startup = new TestStartup()
      .use(async (ctx, next) => {
        if (!ctx.bag("result")) {
          ctx.bag("result", 0);
        }
        ctx.bag("result", ctx.bag<number>("result") + 1);
        await next();
      })
      .use(async (ctx) => {
        ctx.bag("result", ctx.bag<number>("result") + 1);
      });
    let ctx = await startup.run();
    expect(ctx.bag("result")).toBe(2);
    ctx = await startup.run();
    expect(ctx.bag("result")).toBe(2);
    ctx = await startup.run();
    expect(ctx.bag("result")).toBe(2);
  });
});

describe("custom", () => {
  class CustomStartup extends Startup {
    async run(): Promise<Context> {
      return await super.invoke(new Context());
    }
  }

  it("should run with custom startup", async () => {
    const ctx = await new CustomStartup()
      .use((ctx) => {
        ctx.bag("result", {
          msg: "ok",
        });
      })
      .run();

    expect(ctx.bag("result")).toEqual({
      msg: "ok",
    });
  });
});

describe("simple", () => {
  it("should invoke simple startup", async () => {
    let context!: Context;
    await new TestStartup()
      .use(async (ctx) => {
        context = ctx;
      })
      .run();

    expect(context).not.toBeUndefined();
  });

  test("should invoke without md", async () => {
    const ctx = await new TestStartup().run();

    expect(ctx).not.toBeUndefined();
  });
});
