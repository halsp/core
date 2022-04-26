import { Middleware, TestStartup, HookType } from "../../src";

test("simple hook", async () => {
  class TestMiddleware extends Middleware {
    static index = 1;
    async invoke(): Promise<void> {
      this.setHeader(`h${TestMiddleware.index}`, this.count);
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
        ctx.setHeader("after", "1");
      }
    }) // 3 hooks
    .add(TestMiddleware)
    .use((ctx) => ctx.ok());

  const result = await startup.run();
  expect(result.status).toBe(200);
  expect(result.getHeader("h1")).toBe("1");
  expect(result.getHeader("h2")).toBe("2");
  expect(result.getHeader("h3")).toBe("3");
  expect(result.getHeader("h4")).toBeUndefined();
  expect(result.getHeader("after")).toBe("1");
});

function runReturnFalse(type: HookType.BeforeInvoke | HookType.BeforeNext) {
  test(`before hook return false ${type}`, async () => {
    class TestMiddleware extends Middleware {
      static index = 1;
      async invoke(): Promise<void> {
        const index = TestMiddleware.index;
        this.setHeader(`h${index}`, this.count);
        TestMiddleware.index++;
        await this.next();
        this.setHeader(`hn${index}`, this.count);
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
      .add(TestMiddleware)
      .use((ctx) => ctx.ok());

    const result = await startup.run();
    expect(result.status).toBe(404);
    if (type == HookType.BeforeInvoke) {
      expect(result.getHeader("h1")).toBe("1");
      expect(result.getHeader("hn1")).toBe("1");
      expect(result.getHeader("h2")).toBeUndefined();
      expect(result.getHeader("hn2")).toBeUndefined();
      expect(result.getHeader("h3")).toBeUndefined();
      expect(result.getHeader("hn3")).toBeUndefined();
    } else if (type == HookType.BeforeNext) {
      expect(result.getHeader("h1")).toBe("0");
      expect(result.getHeader("hn1")).toBe("1");
      expect(result.getHeader("h2")).toBe("0"); // 为什么是0：BeforeNext 作用于下一个中间件，而当前中间件的 count 在赋值后才 +1
      expect(result.getHeader("hn2")).toBe("2");
      expect(result.getHeader("h3")).toBeUndefined();
      expect(result.getHeader("hn3")).toBeUndefined();
    }
  });
}

runReturnFalse(HookType.BeforeInvoke);
runReturnFalse(HookType.BeforeNext);
