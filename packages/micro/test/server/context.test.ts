import { Request, Response, Startup } from "@halsp/core";
import "../../src/server";
import "@halsp/testing";

describe("context", () => {
  it("should set req.id", () => {
    expect(new Request().id).toBe("");
    expect(new Request().setId("abc").id).toBe("abc");
    expect(new Request().setId(undefined as any).id).toBeUndefined();
  });

  it("should set req.error", () => {
    expect(new Response().error).toBeUndefined();
    expect(new Response().setError("err").error).toBe("err");
    expect(new Response().setError(undefined as any).error).toBeUndefined();
  });
});

describe("payload", () => {
  it("should get req.payload from req.body", () => {
    const req = new Request().setPayload("test");
    expect(req.payload).toBe(req.body);
    expect(req.payload).toBe("test");
  });
  it("should get res.payload from res.body", () => {
    const res = new Response().setPayload("test");
    expect(res.payload).toBe(res.body);
    expect(res.payload).toBe("test");
  });
});

describe("parse pattern", () => {
  it("should parse pattern from path", async () => {
    await new Startup()
      .useMicro()
      .setContext(new Request().setPath("{a:1}"))
      .use((ctx) => {
        expect(ctx.req.pattern).toEqual({
          a: 1,
        });
      })
      .test();
  });
});
