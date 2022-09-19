import { Middleware, HookType } from "../../src";
import { TestStartup } from "../test-startup";

test("simple hook", async () => {
  class TestMiddleware extends Middleware {
    static index = 1;
    async invoke(): Promise<void> {
      this.ctx.bag(`h${TestMiddleware.index}`, this.count);
      TestMiddleware.index++;
      await this.next();
    }
    count = 0;
  }

  const startup = new TestStartup()
    .hook((ctx, md) => {
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .add(TestMiddleware) // 1 hook
    .hook((ctx, md) => {
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .add(TestMiddleware) // 2 hooks
    .hook((ctx, md) => {
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    // executed but without effective
    .hook(HookType.AfterInvoke, (ctx, md) => {
      if (md instanceof TestMiddleware) {
        md.count++;
        ctx.bag("after", 1);
      }
    }) // 3 hooks
    .add(TestMiddleware);

  const result = await startup.run();
  expect(result.bag("h1")).toBe(1);
  expect(result.bag("h2")).toBe(2);
  expect(result.bag("h3")).toBe(3);
  expect(result.bag("h4")).toBeUndefined();
  expect(result.bag("after")).toBe(1);
});

function runReturnFalse(type: HookType.BeforeInvoke | HookType.BeforeNext) {
  test(`before hook return false ${type}`, async () => {
    class TestMiddleware extends Middleware {
      static index = 1;
      async invoke(): Promise<void> {
        const index = TestMiddleware.index;
        this.ctx.bag(`h${index}`, this.count);
        TestMiddleware.index++;
        await this.next();
        this.ctx.bag(`hn${index}`, this.count);
      }
      count = 0;
    }

    const startup = new TestStartup()
      .hook(type, (ctx, md) => {
        if (md instanceof TestMiddleware) {
          md.count++;
          return true;
        }
      })
      .add(TestMiddleware)
      .hook(type, (ctx, md) => {
        if (md instanceof TestMiddleware) {
          md.count++;
          return false;
        }
      })
      .add(TestMiddleware)
      .hook(type, (ctx, md) => {
        if (md instanceof TestMiddleware) {
          md.count++;
          return false;
        }
      })
      .add(TestMiddleware);

    const result = await startup.run();
    if (type == HookType.BeforeInvoke) {
      expect(result.bag("h1")).toBe(1);
      expect(result.bag("hn1")).toBe(1);
      expect(result.bag("h2")).toBeUndefined();
      expect(result.bag("hn2")).toBeUndefined();
      expect(result.bag("h3")).toBeUndefined();
      expect(result.bag("hn3")).toBeUndefined();
    } else if (type == HookType.BeforeNext) {
      expect(result.bag("h1")).toBe(0);
      expect(result.bag("hn1")).toBe(1);
      expect(result.bag("h2")).toBe(0); // 为什么是0：BeforeNext 作用于下一个中间件，而当前中间件的 count 在赋值后才 +1
      expect(result.bag("hn2")).toBe(2);
      expect(result.bag("h3")).toBeUndefined();
      expect(result.bag("hn3")).toBeUndefined();
    }
  });
}

runReturnFalse(HookType.BeforeInvoke);
runReturnFalse(HookType.BeforeNext);
