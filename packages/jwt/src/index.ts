import "@sfajs/core";
import "@sfajs/inject";
import { HttpContext, Startup } from "@sfajs/core";
import { OPTIONS_BAG, STARTUP_OPTIONS } from "./constant";
import { JwtOptions } from "./jwt-options";
import { JwtService } from "./jwt.service";
import { parseInject } from "@sfajs/inject";
import * as jwt from "jsonwebtoken";

export { JwtObject, JwtPayload, JwtToken } from "./decorators";
export {
  JwtOptions,
  JwtVerifyOptions,
  JwtSignOptions,
  JwtSecretRequestType,
} from "./jwt-options";

declare module "@sfajs/core" {
  interface Startup {
    useJwt(options: JwtOptions): this;
    useJwtVerify(
      skip?: (ctx: HttpContext) => boolean | Promise<boolean>,
      onError?: (
        ctx: HttpContext,
        err: jwt.VerifyErrors
      ) => void | Promise<void>
    ): this;
    useJwtExtraAuth(
      access: (ctx: HttpContext) => boolean | Promise<boolean>,
      onError?: (ctx: HttpContext) => void | Promise<void>
    ): this;
  }
  interface HttpContext {
    get jwtToken(): string;
  }
}

Object.defineProperty(HttpContext.prototype, "jwtToken", {
  configurable: false,
  enumerable: false,
  get: function () {
    const ctx = this as HttpContext;
    const opt = ctx.bag<JwtOptions>(OPTIONS_BAG);
    if (opt.getToken) {
      return opt.getToken(ctx.req);
    } else {
      return ctx.req.getHeader("Authorization");
    }
  },
});

Startup.prototype.useJwtVerify = function (
  skip?: (ctx: HttpContext) => boolean | Promise<boolean>,
  onError?: (ctx: HttpContext, err: jwt.VerifyErrors) => void | Promise<void>
): Startup {
  return this.use(async (ctx, next) => {
    if (skip && (await skip(ctx))) {
      await next();
      return;
    }

    const jwtService = await parseInject(ctx, JwtService);
    try {
      await jwtService.verify(ctx.jwtToken);
      await next();
    } catch (err) {
      const error = err as jwt.VerifyErrors;
      if (onError) {
        await onError(ctx, error);
      } else {
        ctx.unauthorizedMsg(error.message);
      }
    }
  });
};

Startup.prototype.useJwtExtraAuth = function (
  access: (ctx: HttpContext) => boolean | Promise<boolean>,
  onError?: (ctx: HttpContext) => void | Promise<void>
): Startup {
  return this.use(async (ctx, next) => {
    if (await access(ctx)) {
      await next();
    } else {
      if (onError) {
        await onError(ctx);
      } else {
        if (ctx.res.status == 404) {
          ctx.unauthorizedMsg("JWT validation failed");
        }
      }
    }
  });
};

Startup.prototype.useJwt = function (options: JwtOptions): Startup {
  if (this[STARTUP_OPTIONS]) {
    return this;
  }
  this[STARTUP_OPTIONS] = options;

  return this.useInject()
    .inject(JwtService)
    .use(async (ctx, next) => {
      ctx.bag(OPTIONS_BAG, options);
      await next();
    });
};
