import { HttpContext, Request } from "../../src";

test("bag", async function () {
  const context = new HttpContext(new Request());
  context.res.setHeader("h1", "1");
  context.res.setHeader("h2", "2");
  context.req.setHeader("h1", "a");
  context.req.setHeader("h2", "b");

  expect(context.res.getHeader("h1")).toBe("1");
  expect(context.res.getHeader("h2")).toBe("2");
  expect(context.req.headers.h1).toBe("a");
  expect(context.req.headers.h2).toBe("b");

  context.refresh(new Request());

  expect(context.res.getHeader("h1")).toBeUndefined();
  expect(context.res.getHeader("h2")).toBeUndefined();
  expect(context.req.headers.h1).toBeUndefined();
  expect(context.req.headers.h2).toBeUndefined();
});
