import { Dict, HttpContext, isString, Request, Response } from "@ipare/core";
import cookie from "cookie";

declare module "@ipare/core" {
  interface Request {
    get cookies(): Dict<string>;
  }
  interface Response {
    get cookies(): Dict<string>;
    set cookies(val: Dict<any>);
    appendCookie(key: string, value: any): this;
    removeCookie(key: string): this;
  }

  interface HttpContext {
    get cookies(): Dict<string>;
    set cookies(val: Dict<any>);
    appendCookie(key: string, value: any): this;
    removeCookie(key: string): this;
  }
}

if (!Object.prototype.hasOwnProperty.call(Request.prototype, "cookies")) {
  Object.defineProperty(Request.prototype, "cookies", {
    configurable: false,
    enumerable: false,
    get: function () {
      const req = this as Request;
      const cookieStr = req.getHeader<string>("cookie") ?? "";
      return cookie.parse(cookieStr);
    },
  });
}

if (!Object.prototype.hasOwnProperty.call(Response.prototype, "cookies")) {
  Object.defineProperty(Response.prototype, "cookies", {
    configurable: false,
    enumerable: false,
    set: function (val: Dict<any>) {
      const res = this as Response;
      res.removeHeader("cookie");
      for (const key in val) {
        res.append("cookie", cookie.serialize(key, val[key]));
      }
    },
    get: function () {
      const res = this as Response;
      const headerCookie = res.getHeader("cookie") ?? "";
      if (isString(headerCookie)) {
        return cookie.parse(headerCookie);
      } else {
        const result: any = {};
        headerCookie.forEach((cookieStr) => {
          const cookies = cookie.parse(cookieStr);
          Object.assign(result, cookies);
        });
        return result;
      }
    },
  });
}

if (!Object.prototype.hasOwnProperty.call(Response.prototype, "appendCookie")) {
  Response.prototype.appendCookie = function (key: string, value: any) {
    const cookies = this.cookies;
    cookies[key] = value;
    this.cookies = cookies;
    return this;
  };
}

if (!Object.prototype.hasOwnProperty.call(Response.prototype, "removeCookie")) {
  Response.prototype.removeCookie = function (key: string) {
    const cookies = this.cookies;
    if (Object.prototype.hasOwnProperty.call(cookies, key)) {
      delete cookies[key];
    }
    this.cookies = cookies;
    return this;
  };
}

if (!Object.prototype.hasOwnProperty.call(HttpContext.prototype, "cookies")) {
  Object.defineProperty(HttpContext.prototype, "cookies", {
    configurable: false,
    enumerable: false,
    set: function (val: Dict<any>) {
      const ctx = this as HttpContext;
      ctx.res.cookies = val;
    },
    get: function () {
      const ctx = this as HttpContext;
      return ctx.req.cookies;
    },
  });
}

if (
  !Object.prototype.hasOwnProperty.call(HttpContext.prototype, "appendCookie")
) {
  HttpContext.prototype.appendCookie = function (key: string, value: any) {
    this.res.appendCookie(key, value);
    return this;
  };
}

if (
  !Object.prototype.hasOwnProperty.call(HttpContext.prototype, "removeCookie")
) {
  HttpContext.prototype.removeCookie = function (key: string) {
    this.res.removeCookie(key);
    return this;
  };
}

export { cookie };
