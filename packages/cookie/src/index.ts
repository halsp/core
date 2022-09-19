import { Dict, Context, isObject, ReadonlyDict, Startup } from "@ipare/core";
import cookie from "cookie";
import setCookieParser from "set-cookie-parser";
import { REQUEST_HEADER_NAME, RESPONSE_HEADER_NAME, USED } from "./constant";
import { Options } from "./options";

export type SetCookieValueWithArgs = {
  value: string;
  path?: string | undefined;
  expires?: Date | undefined;
  maxAge?: number | undefined;
  domain?: string | undefined;
  secure?: boolean | undefined;
  httpOnly?: boolean | undefined;
  sameSite?: string | undefined;
};

export type SetCookieValue = SetCookieValueWithArgs | string;

export { Options };

declare module "@ipare/core" {
  interface Request {
    get cookies(): ReadonlyDict<string>;
  }
  interface Response {
    get cookies(): Dict<SetCookieValue>;
    set cookies(val: Dict<SetCookieValue>);
  }

  interface Context {
    get cookies(): ReadonlyDict<string>;
    set cookies(val: Dict<SetCookieValue>);
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
    let cookies: Dict<string> | undefined = undefined;
    Object.defineProperty(ctx.req, "cookies", {
      configurable: false,
      enumerable: false,
      get: () => {
        if (cookies == undefined) {
          const cookieStr =
            ctx.req.getHeader<string>(REQUEST_HEADER_NAME) ?? "";
          cookies = new Proxy(cookie.parse(cookieStr, options.parse), {
            set: (target, p: string, value) => {
              target[p] = value;
              console.error(
                `Can't set request cookies. You may want to do this: ctx.res.cookies.${p} = ${value}`
              );
              return true;
            },
          });
        }
        return cookies;
      },
    });

    await next();
  }).use(async (ctx, next) => {
    function createOptionsProxy(
      parent: Dict<SetCookieValue>,
      args: SetCookieValueWithArgs
    ) {
      return new Proxy(args, {
        set: (target, p, value) => {
          target[p] = value;
          serializeCookie(ctx, parent, options.serialize);
          return true;
        },
      });
    }
    function createProxy(val: Dict<SetCookieValue>) {
      return new Proxy(val, {
        set: (target, p: string, value) => {
          if (isObject(value)) {
            target[p] = createOptionsProxy(target, value);
          } else {
            target[p] = value;
          }
          serializeCookie(ctx, target, options.serialize);
          return true;
        },
      });
    }

    Object.defineProperty(ctx.res, "cookies", {
      configurable: false,
      enumerable: false,
      get: () => {
        const cookies: Dict<SetCookieValue> = setCookieParser(
          ctx.res.getHeader(RESPONSE_HEADER_NAME) ?? "",
          {
            map: true,
          }
        );
        for (const key in cookies) {
          delete cookies[key]["name"];
          const args = cookies[key];
          if (isObject<SetCookieValueWithArgs>(args)) {
            cookies[key] = createOptionsProxy(cookies, args);
          }
        }
        return createProxy(cookies);
      },
      set: (val: Dict<any>) => {
        serializeCookie(ctx, val, options.serialize);
      },
    });

    Object.defineProperty(ctx, "cookies", {
      configurable: false,
      enumerable: false,
      get: () => ctx.req.cookies,
      set: (val: Dict<any>) => {
        ctx.res.cookies = val;
      },
    });

    await next();
  });
};

function serializeCookie(
  ctx: Context,
  cookies: Dict<SetCookieValue>,
  options?: cookie.CookieSerializeOptions
) {
  ctx.res.removeHeader(RESPONSE_HEADER_NAME);
  for (const key in cookies) {
    const value = cookies[key];
    let cookieStr: string;
    if (isObject<setCookieParser.Cookie>(value)) {
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
