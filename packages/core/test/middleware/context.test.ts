import { Middleware, Startup } from "../../src";
import "../test-startup";

describe("middleware.ctx", () => {
  class TestMiddleware extends Middleware {
    invoke() {
      return;
    }
  }

  it("should init ctx", async () => {
    const md = new TestMiddleware();
    const startup = new Startup();
    await startup.add(() => md).run();
    expect(md.ctx).not.toBeUndefined();
    expect(md.ctx.startup).toBe(startup);
  });

  it("should init req", async () => {
    const md = new TestMiddleware();
    const startup = new Startup();
    await startup.add(() => md).run();
    expect(md.req).toBe(md.ctx.req);
    expect(md.request).toBe(md.ctx.req);
  });

  it("should init res", async () => {
    const md = new TestMiddleware();
    const startup = new Startup();
    await startup.add(() => md).run();
    expect(md.res).toBe(md.ctx.res);
    expect(md.response).toBe(md.ctx.res);
  });

  it("should set logger", async () => {
    const md = new TestMiddleware();
    const startup = new Startup();
    await startup.add(() => md).run();

    expect(md.logger).toBe(startup.logger);
    md.logger = {} as any;
    expect(md.logger).toBe(startup.logger);
  });
});
