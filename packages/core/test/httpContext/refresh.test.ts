import { SimpleStartup, Request } from "../../src";

test("refresh", async function () {
  const startup = new SimpleStartup();
  const ctx1 = startup.ctx;
  startup.ctx.res.setHeader("h1", "1");
  startup.ctx.res.setHeader("h2", "2");
  startup.ctx.req.setHeader("h1", "a");
  startup.ctx.req.setHeader("h2", "b");

  expect(startup.ctx.res.getHeader("h1")).toBe("1");
  expect(startup.ctx.res.getHeader("h2")).toBe("2");
  expect(startup.ctx.req.headers.h1).toBe("a");
  expect(startup.ctx.req.headers.h2).toBe("b");

  startup.refresh();
  const ctx2 = startup.ctx;
  expect(ctx1 == startup.ctx).toBeFalsy();
  expect(startup.ctx.res.getHeader("h1")).toBeUndefined();
  expect(startup.ctx.res.getHeader("h2")).toBeUndefined();
  expect(startup.ctx.req.headers.h1).toBeUndefined();
  expect(startup.ctx.req.headers.h2).toBeUndefined();

  startup.refresh(new Request().setPath("/user"));
  expect(ctx1 == startup.ctx).toBeFalsy();
  expect(ctx2 == startup.ctx).toBeFalsy();
  expect(startup.ctx.res.getHeader("h1")).toBeUndefined();
  expect(startup.ctx.res.getHeader("h2")).toBeUndefined();
  expect(startup.ctx.req.headers.h1).toBeUndefined();
  expect(startup.ctx.req.headers.h2).toBeUndefined();
  expect(startup.ctx.req.path).toBe("user");
});
