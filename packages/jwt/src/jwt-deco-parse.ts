import { HttpContext, ObjectConstructor, isFunction } from "@sfajs/core";
import { JWT_JSON, JWT_PAYLOAD, JWT_STR } from "./constant";
import * as jwt from "jsonwebtoken";
import { JwtService } from "./jwt.service";

type JwtParseTarget<T extends object = any> = T | ObjectConstructor<T>;

class JwtDecoParser<T extends object = any> {
  constructor(
    private readonly ctx: HttpContext,
    private readonly target: JwtParseTarget<T>
  ) {
    const isConstructor = isFunction(this.target);
    this.objConstructor = isConstructor
      ? (this.target as ObjectConstructor<T>)
      : ((this.target as T).constructor as ObjectConstructor<T>);
    this.obj = isConstructor
      ? new (this.target as ObjectConstructor<T>)()
      : (this.target as T);
  }

  private readonly obj: T;
  private readonly objConstructor: ObjectConstructor<T>;

  public parse(): T {
    const jwtService = new JwtService(this.ctx);
    this.parseProps(JWT_STR, this.ctx.jwtToken);
    this.parseProps(
      JWT_JSON,
      jwtService.decode(this.ctx.jwtToken, {
        complete: true,
        json: true,
      })
    );
    this.parseProps(
      JWT_PAYLOAD,
      jwtService.decode(this.ctx.jwtToken, {
        complete: false,
        json: true,
      })
    );

    return this.obj;
  }

  private parseProps(key: string, value: any) {
    const tokenProps =
      (Reflect.getMetadata(key, this.objConstructor.prototype) as (
        | string
        | symbol
      )[]) ?? [];
    tokenProps.forEach((prop) => {
      this.obj[prop] = value;
    });
  }
}

export function parseJwtDeco<T extends object = any>(
  ctx: HttpContext,
  target: JwtParseTarget<T>
): T {
  return new JwtDecoParser<T>(ctx, target).parse();
}
