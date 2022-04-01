import { HttpContext, isObject } from "@sfajs/core";
import Action from "../../action";
import { ROUTE_ARGS_METADATA } from "../../constant";
import { ActionDecoratorValue } from "./action-decorator-value";
import { ActionDecoratorTypes } from "./action-decorator-types";

export class ActionDecoratorParser {
  constructor(
    private readonly ctx: HttpContext,
    private readonly act: Action
  ) {}

  public parse(): Action {
    const decs =
      (Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        this.act.constructor.prototype
      ) as ActionDecoratorValue[]) ?? [];
    decs.forEach((dec) => {
      this.parseAction(dec);
    });
    return this.act;
  }

  private parseAction(dec: ActionDecoratorValue) {
    switch (dec.type) {
      case ActionDecoratorTypes.Query:
        this.parseProperty(dec, this.ctx.req.query);
        break;
      case ActionDecoratorTypes.Param:
        this.parseProperty(dec, this.ctx.req.params);
        break;
      case ActionDecoratorTypes.Header:
        this.parseProperty(dec, this.ctx.req.headers);
        break;
      case ActionDecoratorTypes.Body:
        this.parseProperty(dec, this.ctx.req.body);
        break;
    }
  }

  private parseProperty(dec: ActionDecoratorValue, val: object) {
    if (!dec.property) {
      this.act[dec.propertyKey] = val;
    } else {
      if (isObject(val) && !Array.isArray(val)) {
        this.act[dec.propertyKey] = val[dec.property];
      } else {
        this.act[dec.propertyKey] = undefined;
      }
    }
  }
}
