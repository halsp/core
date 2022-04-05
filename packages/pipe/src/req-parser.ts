import {
  HttpContext,
  isObject,
  ObjectConstructor,
  isFunction,
} from "@sfajs/core";
import { REQ_PARAMS_METADATA } from "./constant";
import { ReqParseType, ReqParseItem } from "./req-parse-item";

export type ReqParseTarget<T extends object = any> = T | ObjectConstructor<T>;

export class ReqParser<T extends object = any> {
  constructor(
    private readonly ctx: HttpContext,
    private readonly target: ReqParseTarget<T>
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
    const decs =
      (Reflect.getMetadata(
        REQ_PARAMS_METADATA,
        this.objConstructor.prototype
      ) as ReqParseItem[]) ?? [];
    decs.forEach((dec) => {
      this.parseAction(dec);
    });
    return this.obj;
  }

  private parseAction(dec: ReqParseItem) {
    switch (dec.type) {
      case ReqParseType.Query:
        this.parseProperty(dec, this.ctx.req.query);
        break;
      case ReqParseType.Param:
        this.parseProperty(dec, (this.ctx.req as any).params);
        break;
      case ReqParseType.Header:
        this.parseProperty(dec, this.ctx.req.headers);
        break;
      case ReqParseType.Body:
        this.parseProperty(dec, this.ctx.req.body);
        break;
    }
  }

  private parseProperty(dec: ReqParseItem, val: object) {
    if (!dec.property) {
      this.obj[dec.propertyKey] = val ?? {};
    } else {
      if (isObject(val) && !Array.isArray(val)) {
        this.obj[dec.propertyKey] = val[dec.property];
      } else {
        this.obj[dec.propertyKey] = undefined;
      }
    }
  }
}

export function parseReq<T extends object = any>(
  ctx: HttpContext,
  target: ReqParseTarget<T>
): T {
  return new ReqParser<T>(ctx, target).parse();
}
