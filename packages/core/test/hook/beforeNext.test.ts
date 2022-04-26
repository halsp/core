import { Middleware, TestStartup, HookType, HookTypeBefore } from "../../src";

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
    .hook((ctx, md) => {
      if (md instanceof TestMiddleware) {
        md.count++;
        ctx.setHeader("after", "1");
      }
    }, HookType.AfterInvoke) // 3 hooks
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

function runReturnFalse(type: HookTypeBefore) {
  test(`before hook return false ${type}`, async () => {
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
          return true;
        }
      }, type)
      .add(TestMiddleware)
      .hook((ctx, md) => {
        if (md instanceof TestMiddleware) {
          md.count++;
          return false;
        }
      }, type)
      .add(TestMiddleware)
      .hook((ctx, md) => {
        if (md instanceof TestMiddleware) {
          md.count++;
          return false;
        }
      }, type)
      .add(TestMiddleware)
      .use((ctx) => ctx.ok());

    const result = await startup.run();
    expect(result.status).toBe(404);
    if (type == HookType.BeforeInvoke) {
      expect(result.getHeader("h1")).toBe("1");
      expect(result.getHeader("h2")).toBeUndefined();
      expect(result.getHeader("h3")).toBeUndefined();
    } else if (type == HookType.BeforeNext) {
      expect(result.getHeader("h1")).toBe("0");
      expect(result.getHeader("h2")).toBe("0");
      expect(result.getHeader("h3")).toBeUndefined();
    }
  });
}

runReturnFalse(HookType.BeforeInvoke);
runReturnFalse(HookType.BeforeNext);
