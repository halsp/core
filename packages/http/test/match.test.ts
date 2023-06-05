import { Request, Startup } from "@halsp/core";
import "../src";
import "@halsp/testing";

async function testMatch(options: {
  path: string;
  method?: string;
  register: string;
  registerExec: boolean;
  status?: number;
}) {
  const req = new Request().setPath(options.path);
  if (options.method) {
    req.setMethod(options.method);
  }

  const res = await new Startup()
    .useHttp()
    .setContext(req)
    .register(options.register, (ctx) => {
      ctx.set("register", true);
    })
    .use(async (ctx) => {
      ctx.set("use", true);
    })
    .test();

  expect(res.status).toBe(options.status ?? 404);
  expect(res.ctx.get("use")).toBeTruthy();
  expect(res.ctx.get("register")).toBe(options.registerExec || undefined);

  return res;
}

describe("match", () => {
  it("should match", async () => {
    await testMatch({
      path: "",
      method: "GET",
      register: "GET//",
      registerExec: true,
    });

    await testMatch({
      path: "test",
      method: "GET",
      register: "GET//test",
      registerExec: true,
    });

    await testMatch({
      path: "test/a/b/c",
      method: "GET",
      register: "GET//test/a/b/c",
      registerExec: true,
    });

    await testMatch({
      path: "test",
      method: "POST",
      register: "GET,POST,PUT//test",
      registerExec: true,
    });
  });

  it("should not match path", async () => {
    await testMatch({
      path: "",
      method: "GET",
      register: "GET//test",
      registerExec: false,
    });

    await testMatch({
      path: "test",
      method: "GET",
      register: "GET//",
      registerExec: false,
    });
  });

  it("should be 405 when the method is not match", async () => {
    await testMatch({
      path: "test",
      method: "POST",
      register: "GET//test",
      registerExec: false,
      status: 405,
    });

    await testMatch({
      path: "test",
      method: "POST",
      register: "GET,PUT//test",
      registerExec: false,
      status: 405,
    });
  });

  it("should perfer static path", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("test/abc"))
      .register("test/^id", (ctx) => {
        ctx.set("register1", true);
      })
      .register("test/abc", (ctx) => {
        ctx.set("register2", true);
      })
      .register("test/def", (ctx) => {
        ctx.set("register3", true);
      })
      .use(async (ctx) => {
        ctx.set("use", true);
      })
      .test();

    expect(res.ctx.get("use")).toBeTruthy();
    expect(res.ctx.get("register1")).toBeFalsy();
    expect(res.ctx.get("register2")).toBeTruthy();
    expect(res.ctx.get("register3")).toBeFalsy();
  });

  it("should perfer normal method then any", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("GET").setPath("test"))
      .register("test", (ctx) => {
        ctx.set("register1", true);
      })
      .register("ANY//test", (ctx) => {
        ctx.set("register2", true);
      })
      .register("GET//test", (ctx) => {
        ctx.set("register3", true);
      })
      .register("POST,PUT//test", (ctx) => {
        ctx.set("register4", true);
      })
      .use(async (ctx) => {
        ctx.set("use", true);
      })
      .test();

    expect(res.ctx.get("use")).toBeTruthy();
    expect(res.ctx.get("register1")).toBeFalsy();
    expect(res.ctx.get("register2")).toBeFalsy();
    expect(res.ctx.get("register3")).toBeTruthy();
    expect(res.ctx.get("register4")).toBeFalsy();
  });
});

describe("params", () => {
  it("should parse params", async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("test/1"))
      .register("test/^id", (ctx) => {
        ctx.set("register", true);
      })
      .use(async (ctx) => {
        ctx.set("use", true);
      })
      .test();

    expect(res.ctx.get("register")).toBeTruthy();
    expect(res.ctx.get("use")).toBeTruthy();
    expect(res.ctx.req.params).toBe(res.ctx.req["param"]);
    expect(res.ctx.req.params).toEqual({ id: "1" });
  });
});
