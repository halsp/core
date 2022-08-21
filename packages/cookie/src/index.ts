import { Dict, HttpContext, isObject, Startup } from "@ipare/core";
import cookie, { CookieSerializeOptions } from "cookie";
import { REQUEST_HEADER_NAME, RESPONSE_HEADER_NAME, USED } from "./constant";
import { Options } from "./options";

export type CookieValue =
  | (CookieSerializeOptions & {
      value?: string;
    })
  | string
  | undefined;

declare module "@ipare/core" {
  interface Request {
    get cookies(): Dict<string>;
  }
  interface Response {
    get cookies(): Dict<CookieValue>;
    set cookies(val: Dict<CookieValue>);
  }

  interface HttpContext {
    get cookies(): Dict<string>;
    set cookies(val: Dict<CookieValue>);
  }

  interface Startup {
    useCookie(options?: Options): this;
  }
}

Startup.prototype.useCookie = function (options: Options = {}) {
  if (this[USED]) {
    return this;
  }
  this[USED] = true;

  return this.use(async (ctx, next) => {
    const cookieStr = ctx.req.getHeader<string>(REQUEST_HEADER_NAME) ?? "";
    const cookies = cookie.parse(cookieStr, options.parse);

    Object.defineProperty(ctx.req, "cookies", {
      configurable: false,
      enumerable: false,
      get: () => cookies,
    });

    await next();
  }).use(async (ctx, next) => {
    let cookies: Dict<CookieValue> = {};

    Object.defineProperty(ctx, "cookies", {
      configurable: false,
      enumerable: false,
      get: () => ctx.req.cookies,
      set: (val: Dict<any>) => {
        cookies = val;
      },
    });

    Object.defineProperty(ctx.res, "cookies", {
      configurable: false,
      enumerable: false,
      get: () => cookies,
      set: (val: Dict<any>) => {
        cookies = val;
      },
    });

    try {
      await next();
    } finally {
      if (!ctx.res.hasHeader(RESPONSE_HEADER_NAME)) {
        serializeCookie(ctx, cookies, options.serialize);
      }
    }
  });
};

function serializeCookie(
  ctx: HttpContext,
  cookies: Dict<CookieValue>,
  options?: cookie.CookieSerializeOptions
) {
  for (const key in cookies) {
    const value = cookies[key];
    let cookieStr: string;
    if (isObject<CookieSerializeOptions>(value)) {
      cookieStr = cookie.serialize(
        key,
        String(value.value),
        Object.assign({}, options ?? {}, value)
      );
    } else {
      cookieStr = cookie.serialize(key, String(value), options);
    }
    ctx.res.append(RESPONSE_HEADER_NAME, cookieStr);
  }
}

export { cookie, Options };
