import { Response, Request, HttpContext } from "@ipare/core";
import "../src";

describe("cookies property", () => {
  it("should get cookies from request", async () => {
    const ctx = new HttpContext(
      new Request().setHeader("cookie", "str=abc;num=123")
    );
    expect(ctx.cookies).toEqual({
      str: "abc",
      num: "123",
    });
    expect(ctx.req.cookies).toEqual(ctx.cookies);
  });

  it("should set cookies by dict", async () => {
    const res = new Response();
    res.cookies = {
      str: "abc",
      num: 123,
    };

    expect(res.cookies).toEqual({
      str: "abc",
      num: "123",
    });
    expect(res.getHeader("cookie")).toEqual(["str=abc", "num=123"]);
  });

  it("should be empty object if there is no cookie", async () => {
    const req = new Request();
    expect(req.cookies).toEqual({});
  });
});

describe("appendCookie", () => {
  it("should append and replace cookie to response", async () => {
    const ctx = new HttpContext(new Request());
    ctx.res.appendCookie("str", "abc");
    ctx.res.appendCookie("num", "123");
    ctx.appendCookie("num", "456");

    expect(ctx.res.getHeader("cookie")).toEqual(["str=abc", "num=456"]);
    expect(ctx.res.cookies).toEqual({
      str: "abc",
      num: "456",
    });
  });
});

describe("removeCookie", () => {
  it("should remove cookie from response", async () => {
    const ctx = new HttpContext(new Request());
    ctx.cookies = {
      str: "abc",
      num: "123",
      num2: "456",
    };
    ctx.res.removeCookie("str");
    ctx.removeCookie("num");

    expect(ctx.res.getHeader("cookie")).toBe("num2=456");
    expect(ctx.res.cookies).toEqual({
      num2: "456",
    });
  });
});
