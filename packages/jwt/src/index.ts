import "@halsp/inject";
import { Startup, Context } from "@halsp/core";
import { OPTIONS } from "./constant";
import { JwtOptions } from "./jwt-options";
import { JwtService } from "./jwt.service";
import * as jwt from "jsonwebtoken";

export { JwtObject, JwtPayload, JwtToken } from "./decorators";
export {
  JwtOptions,
  JwtVerifyOptions,
  JwtSignOptions,
  JwtSecretRequestType,
} from "./jwt-options";
export { JwtService };

declare module "@halsp/core" {
  interface Context {
    get jwtToken(): string;
  }
}
declare module "@halsp/core" {
  interface Startup {
    useJwt(options: JwtOptions): this;
    useJwtVerify(
      skip?: (ctx: Context) => boolean | Promise<boolean>,
      onError?: (ctx: Context, err: jwt.VerifyErrors) => void | Promise<void>,
    ): this;
    useJwtExtraAuth(access: (ctx: Context) => boolean | Promise<boolean>): this;
  }
}

Startup.prototype.useJwtVerify = function (
  skip?: (ctx: Context) => boolean | Promise<boolean>,
  onError?: (ctx: Context, err: jwt.VerifyErrors) => void | Promise<void>,
) {
  return this.use(async (ctx, next) => {
    if (skip && (await skip(ctx))) {
      await next();
      return;
    }

    const jwtService = await ctx.getService(JwtService);
    try {
      await jwtService.verify();
      await next();
    } catch (err) {
      const error = err as jwt.VerifyErrors;
      if (onError) {
        await onError(ctx, error);
      } else if (process.env.HALSP_ENV == "http") {
        ctx["unauthorizedMsg"](error.message);
      } else if (process.env.HALSP_ENV == "micro") {
        ctx.res["error"] = error;
      } else {
        throw err;
      }
    }
  });
};

Startup.prototype.useJwtExtraAuth = function (
  access: (ctx: Context) => boolean | Promise<boolean>,
) {
  return this.use(async (ctx, next) => {
    if (await access(ctx)) {
      return await next();
    }

    if (process.env.HALSP_ENV == "http") {
      ctx["unauthorizedMsg"]("JWT validation failed");
    } else if (process.env.HALSP_ENV == "micro") {
      ctx.res["error"] = "JWT validation failed";
    }
  });
};

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useJwt = function (options: JwtOptions) {
  if (usedMap.get(this)) return this;
  usedMap.set(this, true);

  return this.useInject()
    .inject(JwtService)
    .use(async (ctx, next) => {
      ctx.set(OPTIONS, options);

      Object.defineProperty(ctx, "jwtToken", {
        configurable: false,
        enumerable: false,
        get: () => {
          if (options.tokenProvider) {
            return options.tokenProvider(ctx);
          } else if (process.env.HALSP_ENV == "http") {
            return ctx.req["get"]("Authorization");
          } else if (process.env.HALSP_ENV == "micro") {
            return ctx.req.body ? ctx.req.body["token"] : undefined;
          } else {
            return undefined;
          }
        },
      });

      await next();
    });
};
