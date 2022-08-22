import { Request } from "@ipare/core";
import "../src";
import { REQUEST_HEADER_NAME, RESPONSE_HEADER_NAME } from "../src/constant";
import { TestStartup } from "@ipare/testing";

describe("get cookie", () => {
  it("should get cookies from request", async () => {
    await new TestStartup()
      .setRequest(
        new Request().setHeader(REQUEST_HEADER_NAME, "str=abc;num=123")
      )
      .use(async (ctx, next) => {
        await next();
        expect(ctx.cookies).toEqual({
          num: "123",
          str: "abc",
        });
        expect(ctx.req.cookies).toBe(ctx.cookies);
      })
      .useCookie()
      .run();
  });

  it("should be empty object if there is no cookie", async () => {
    await new TestStartup()
      .useCookie()
      .useCookie()
      .use(async (ctx) => {
        expect(ctx.req.cookies).toEqual({});
      })
      .run();
  });
});

describe("set cookie", () => {
  it("should set cookies to response", async () => {
    await new TestStartup()
      .use(async (ctx, next) => {
        await next();
        expect(ctx.res.cookies).toEqual({
          str: {
            value: "abc",
          },
          num: {
            value: "123",
          },
        });
        expect(ctx.res.getHeader(RESPONSE_HEADER_NAME)).toEqual([
          "str=abc",
          "num=123",
        ]);
      })
      .useCookie()
      .use(async (ctx) => {
        ctx.res.cookies = {
          str: "abc",
          num: 123 as any,
        };
      })
      .run();
  });

  it("should set cookies to response by ctx", async () => {
    await new TestStartup()
      .use(async (ctx, next) => {
        await next();
        expect(ctx.res.getHeader(RESPONSE_HEADER_NAME)).toBe("str=abc");
      })
      .useCookie()
      .use(async (ctx) => {
        ctx.cookies = {
          str: "abc",
        };
      })
      .run();
  });

  it("should set cookies properties", async () => {
    await new TestStartup()
      .use(async (ctx, next) => {
        await next();
        expect(ctx.res.cookies).toEqual({
          str: {
            value: "abc",
          },
          num: {
            value: "123",
          },
        });
        expect(ctx.res.getHeader(RESPONSE_HEADER_NAME)).toEqual([
          "str=abc",
          "num=123",
        ]);
      })
      .useCookie()
      .use(async (ctx) => {
        ctx.res.cookies = {};
        ctx.res.cookies.str = "abc";
        ctx.res.cookies["num"] = 123 as any;
      })
      .run();
  });

  it("should log error if set request cookies", async () => {
    await new TestStartup()
      .useCookie()
      .use(async (ctx) => {
        const errLog = console.error;
        let msg: string | undefined = undefined;
        try {
          console.error = (...data: any[]) => {
            msg = data[0];
          };
          (ctx.cookies as any).a = "abc";
        } finally {
          console.error = errLog;
        }
        expect(msg).toBe(
          `Can't set request cookies. You may want to do this: ctx.res.cookies.a = abc`
        );
        expect(ctx.cookies).toEqual({
          a: "abc",
        });
        expect(ctx.res.cookies).toEqual({});
        expect(ctx.req.cookies).toEqual({
          a: "abc",
        });
      })
      .run();
  });
});

describe("options", () => {
  it("should serialize with useCookie options", async () => {
    await new TestStartup()
      .use(async (ctx, next) => {
        await next();
        expect(ctx.res.getHeader(RESPONSE_HEADER_NAME)).toBe(
          "str=abc; Path=def"
        );
      })
      .useCookie({
        serialize: {
          path: "def",
        },
      })
      .use(async (ctx) => {
        ctx.cookies = {
          str: "abc",
        };
      })
      .run();
  });

  it("should serialize with value options", async () => {
    await new TestStartup()
      .use(async (ctx, next) => {
        await next();
        expect(ctx.res.getHeader(RESPONSE_HEADER_NAME)).toBe(
          "str=abc; Path=def"
        );
      })
      .useCookie()
      .use(async (ctx) => {
        ctx.cookies = {
          str: {
            value: "abc",
            path: "def",
          },
        };
      })
      .run();
  });

  it("should replace serialize", async () => {
    await new TestStartup()
      .use(async (ctx, next) => {
        await next();
        expect(ctx.res.getHeader(RESPONSE_HEADER_NAME)).toBe(
          "str=abc; Path=def"
        );
      })
      .useCookie({
        serialize: {
          path: "ghi",
        },
      })
      .use(async (ctx) => {
        ctx.cookies = {
          str: {
            value: "abc",
            path: "def",
          },
        };
      })
      .run();
  });
});
