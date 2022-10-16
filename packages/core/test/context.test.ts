import { Context, Request, Response } from "../src";
import { TestStartup } from "./test-startup";

async function getContext() {
  return await new TestStartup().run();
}

describe("ctx.bag", () => {
  it("bag", async () => {
    const { ctx } = await getContext();
    ctx.bag("BAG1", "BAG1");
    ctx.bag("BAG2", { bag2: "BAG2" });

    expect(ctx.bag("BAG1")).toBe("BAG1");
    expect(ctx.bag<any>("BAG2").bag2).toBe("BAG2");
    expect(ctx.bag<any>("BAG2")).toBe(ctx.bag<any>("BAG2"));
  });

  it("transient bag", async () => {
    const { ctx } = await getContext();
    ctx.bag("BAG3", "transient", () => "BAG3");
    ctx.bag("BAG4", "transient", () => ({ bag4: "BAG4" }));

    expect(ctx.bag("BAG3")).toBe("BAG3");
    expect(ctx.bag<any>("BAG4").bag4).toBe("BAG4");
    expect(ctx.bag<any>("BAG4")).toEqual(ctx.bag<any>("BAG4"));
    expect(ctx.bag<any>("BAG4")).not.toBe(ctx.bag<any>("BAG4"));
  });

  it("scoped bag", async () => {
    const { ctx } = await getContext();
    ctx.bag("BAG3", "scoped", () => "BAG3");
    ctx.bag("BAG4", "scoped", () => ({ bag4: "BAG4" }));

    expect(ctx.bag("BAG3")).toBe("BAG3");
    expect(ctx.bag<any>("BAG4").bag4).toBe("BAG4");
    expect(ctx.bag<any>("BAG4")).toBe(ctx.bag<any>("BAG4"));
  });

  it("singleton bag", async () => {
    {
      const { ctx } = await getContext();
      ctx.bag("BAG3", "singleton", () => "BAG3");
      ctx.bag("BAG4", "singleton", () => ({ bag4: "BAG4" }));

      expect(ctx.bag("BAG3")).toBe("BAG3");
      expect(ctx.bag<any>("BAG4").bag4).toBe("BAG4");
      expect(ctx.bag<any>("BAG4")).toBe(ctx.bag<any>("BAG4"));
    }

    {
      const { ctx } = await getContext();
      ctx.bag("BAG3", "singleton", () => "BAG3");
      ctx.bag("BAG4", "singleton", () => ({ bag4: "BAG4" }));

      expect(ctx.bag("BAG3")).toBe("BAG3");
      expect(ctx.bag<any>("BAG4").bag4).toBe("BAG4");
      expect(ctx.bag<any>("BAG4")).toBe(ctx.bag<any>("BAG4"));
    }
  });
});

describe("req", () => {
  it("should init req", async () => {
    const req = new Request();
    const ctx = new Context(req);
    expect(ctx.req).toBe(req);
    expect(ctx.req).toBe(ctx.request);
    expect(req.ctx).toBe(ctx);
  });

  it("should init res", async () => {
    const ctx = new Context();
    expect(ctx.res instanceof Response).toBeTruthy();
    expect(ctx.res).toBe(ctx.response);
    expect(ctx.res).not.toBeUndefined();
    expect(ctx.res.ctx).toBe(ctx);
  });
});
