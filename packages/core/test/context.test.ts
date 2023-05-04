import { Context, Request, Response, Startup } from "../src";
import "./test-startup";

async function getContext() {
  return await new Startup().run();
}

describe("ctx bag", () => {
  it("transient bag", async () => {
    const { ctx } = await getContext();
    ctx.set("BAG3", "transient", () => "BAG3");
    ctx.set("BAG4", "transient", () => ({ bag4: "BAG4" }));

    expect(ctx.get("BAG3")).toBe("BAG3");
    expect(ctx.get<any>("BAG4").bag4).toBe("BAG4");
    expect(ctx.get<any>("BAG4")).toEqual(ctx.get<any>("BAG4"));
    expect(ctx.get<any>("BAG4")).not.toBe(ctx.get<any>("BAG4"));
  });

  it("scoped bag", async () => {
    const { ctx } = await getContext();
    ctx.set("BAG3", "scoped", () => "BAG3");
    ctx.set("BAG4", "scoped", () => ({ bag4: "BAG4" }));

    expect(ctx.get("BAG3")).toBe("BAG3");
    expect(ctx.get<any>("BAG4").bag4).toBe("BAG4");
    expect(ctx.get<any>("BAG4")).toBe(ctx.get<any>("BAG4"));
  });

  it("singleton bag", async () => {
    {
      const { ctx } = await getContext();
      ctx.set("BAG3", "singleton", () => "BAG3");
      ctx.set("BAG4", "singleton", () => ({ bag4: "BAG4" }));

      expect(ctx.get("BAG3")).toBe("BAG3");
      expect(ctx.get<any>("BAG4").bag4).toBe("BAG4");
      expect(ctx.get<any>("BAG4")).toBe(ctx.get<any>("BAG4"));
    }

    {
      const { ctx } = await getContext();
      ctx.set("BAG3", "singleton", () => "BAG3");
      ctx.set("BAG4", "singleton", () => ({ bag4: "BAG4" }));

      expect(ctx.get("BAG3")).toBe("BAG3");
      expect(ctx.get<any>("BAG4").bag4).toBe("BAG4");
      expect(ctx.get<any>("BAG4")).toBe(ctx.get<any>("BAG4"));
    }
  });

  it("delete", async () => {
    const { ctx } = await getContext();
    ctx.set("BAG1", "BAG1");
    expect(ctx.length).toBe(1);
    ctx.set("BAG2", "BAG2");
    expect(ctx.length).toBe(2);
    ctx.delete("BAG1");
    expect(ctx.length).toBe(1);
    ctx.delete("BAG2");
    expect(ctx.length).toBe(0);
    expect(ctx.has("BAG1")).toBeFalsy();
    expect(ctx.has("BAG2")).toBeFalsy();
  });
});

describe("req", () => {
  it("should init req", async () => {
    const ctx = new Context();
    expect(ctx.req instanceof Request).toBeTruthy();
    expect(ctx.req).toBe(ctx.request);
    expect(ctx.req).not.toBeUndefined();
    expect(ctx.req.ctx).toBe(ctx);
  });

  it("should init res", async () => {
    const ctx = new Context();
    expect(ctx.res instanceof Response).toBeTruthy();
    expect(ctx.res).toBe(ctx.response);
    expect(ctx.res).not.toBeUndefined();
    expect(ctx.res.ctx).toBe(ctx);
  });
});

describe("body", () => {
  it("should set req.body", async () => {
    const req = new Request().setBody("abc");
    expect(req.body).toBe("abc");
  });

  it("should set res.body", async () => {
    const req = new Response().setBody("abc");
    expect(req.body).toBe("abc");
  });
});

describe("req.path", () => {
  it("should set illegal path", async () => {
    const req = new Request().setPath("\\user");
    expect(req.path).toBe("user");
  });

  it("should set emtpy path", async () => {
    const req = new Request().setPath("");
    expect(req.path).toBe("");
  });

  it("should set path null", async () => {
    const req = new Request().setPath(null as any);
    expect(req.path).toBe("");
  });

  it("should save originalPath", async () => {
    const req = new Request().setPath("/abc/");

    expect(req.path).toBe("abc");
    expect(req.originalPath).toBe("/abc/");
  });

  it("should set path with https", async () => {
    const req = new Request().setPath("https://halsp.org/a/b");
    expect(req.path).toBe("a/b");
    expect(req.originalPath).toBe("/a/b");
  });

  it("should set empty path with https", async () => {
    const req = new Request().setPath("https://halsp.org");
    expect(req.path).toBe("");
    expect(req.originalPath).toBe("");
  });

  it("should set empty path with https and end with /", async () => {
    const req = new Request().setPath("https://halsp.org/");
    expect(req.path).toBe("");
    expect(req.originalPath).toBe("/");
  });

  it("should set path with http", async () => {
    const req = new Request().setPath("http://halsp.org/a/b");
    expect(req.path).toBe("a/b");
    expect(req.originalPath).toBe("/a/b");
  });

  it("should set path with http and port", async () => {
    const req = new Request().setPath("http://halsp.org:8080/a/b");
    expect(req.path).toBe("a/b");
    expect(req.originalPath).toBe("/a/b");
  });

  it("should set path with http,port,query", async () => {
    const req = new Request().setPath("http://halsp.org:8080/a/b?c=1");
    expect(req.path).toBe("a/b");
    expect(req.originalPath).toBe("/a/b");
  });

  it("should set path with http:/", async () => {
    const req = new Request().setPath("http:/halsp.org/a/b");
    expect(req.path).toBe("a/b");
    expect(req.originalPath).toBe("/a/b");
  });
});
