import { Context, Middleware, Response, Startup } from "@halsp/core";
import {
  getReasonPhrase,
  getStatusCode,
  HeadersDict,
  ReasonPhrases,
  StatusCodes,
} from "../src";

test("setHeader", async () => {
  const res = new Response()
    .setHeader("h1", "1")
    .setHeader("h2", "2")
    .setHeader("h3", "3")
    .setHeader("h4", undefined as unknown as string);

  expectHeaders(res.headers);
});

test("setHeaders", async () => {
  const req = new Response().setHeaders({
    h1: "1",
    h2: "2",
    h3: "3",
  });
  expectHeaders(req.headers);
});

test("removeHeader", async () => {
  const res = new Response()
    .setHeader("h1", "1")
    .setHeader("h2", "2")
    .setHeader("h3", "3")
    .setHeader("h4", "4")
    .removeHeader("h4")
    .removeHeader("h5");

  expectHeaders(res.headers);
});

function expectHeaders(headers: HeadersDict) {
  expect(headers.h1).toBe("1");
  expect(headers.h2).toBe("2");
  expect(headers.h3).toBe("3");
  expect(headers.h4).toBe(undefined);
  expect(headers.h5).toBe(undefined);
}

test("array headers", async () => {
  const res = new Response().setHeaders({
    h1: 1,
    h2: ["2.1", 2.2],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h3: undefined as any,
  });
  expect(res.headers.h1).toBe("1");
  expect(res.headers.h2).toEqual(["2.1", "2.2"]);
  expect(res.headers.h3).toBeUndefined();
});

test("append header", async () => {
  const res = new Response()
    .appendHeader("h1", 1)
    .appendHeader("h1", "2")
    .appendHeader("h1", [3, "4"]);
  expect(res.headers.h1).toEqual(["1", "2", "3", "4"]);
});

test("status code", () => {
  expect(StatusCodes).not.toBeUndefined();
  expect(getStatusCode).not.toBeUndefined();
  expect(ReasonPhrases).not.toBeUndefined();
  expect(getReasonPhrase).not.toBeUndefined();
});

it("should get from md.req and set to md.res", async () => {
  class TestMiddleware extends Middleware {
    invoke(): void | Promise<void> {
      this.set("h1", 1);
      this.response.set("h2", 2);
      this.request.set("h3", 3);

      expect(this.get("h1")).toBeUndefined();
      expect(this.get("h2")).toBeUndefined();
      expect(this.get("h3")).toBe("3");
    }
  }
  await new Startup().useHttp().add(TestMiddleware)["invoke"]();
});

it("should append to ctx.res", async () => {
  const ctx = new Context();
  ctx.res.append("h1", 1);
  ctx.res.append("h1", 2);

  expect(ctx.res.get("h1")).toEqual(["1", "2"]);
});

it("should remove to ctx.res", async () => {
  const ctx = new Context();
  ctx.res.set("h1", 1);
  expect(ctx.response.get("h1")).toBe("1");
  ctx.res.remove("h1");
  expect(ctx.res.get("h1")).toBeUndefined();
});

it("should has from ctx.req", async () => {
  const ctx = new Context();
  ctx.req.set("h1", 1);

  expect(ctx.req.has("h1")).toBeTruthy();
});
