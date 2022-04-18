import "@sfajs/core";
import { HttpContext, Startup } from "@sfajs/core";
import { OPTIONS_BAG, STARTUP_OPTIONS } from "./constant";
import { parseJwtDeco } from "./jwt-deco-parse";
import { JwtOptions } from "./jwt-options";
import { JwtService } from "./jwt.service";
import * as jwt from "jsonwebtoken";

export { JwtJson, JwtPayload, JwtStr } from "./decorators";
export {
  JwtOptions,
  JwtVerifyOptions,
  JwtSignOptions,
  JwtSecretRequestType,
} from "./jwt-options";
export { parseJwtDeco } from "./jwt-deco-parse";

declare module "@sfajs/core" {
  interface Startup {
    useJwt(options: JwtOptions): this;
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

Startup.prototype.useJwt = function (options: JwtOptions): Startup {
  if (this[STARTUP_OPTIONS]) {
    return this;
  }
  this[STARTUP_OPTIONS] = options;

  return this.use(async (ctx, next) => {
    ctx.bag(OPTIONS_BAG, options);
    await next();
  })
    .use(async (ctx, next) => {
      const opt = ctx.bag<JwtOptions>(OPTIONS_BAG);
      if (opt.auth) {
        if (await opt.auth(ctx)) {
          await next();
        } else {
          if (ctx.res.status == 404) {
            ctx.unauthorizedMsg("JWT validation failed");
          }
        }
      } else {
        const jwtService = new JwtService(ctx);
        try {
          await jwtService.verify(ctx.jwtToken);
          await next();
        } catch (err) {
          const error = err as jwt.VerifyErrors;
          ctx.unauthorizedMsg(error.message);
        }
      }
    })
    .hook((ctx, mh) => {
      parseJwtDeco(ctx, mh);
    });
};
