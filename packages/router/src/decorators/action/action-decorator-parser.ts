import { HttpContext } from "@sfajs/core";
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
      this.setProperty(dec);
    });
    return this.act;
  }

  private setProperty(dec: ActionDecoratorValue) {
    switch (dec.type) {
      case ActionDecoratorTypes.Query:
        this.act[dec.propertyKey] = this.ctx.req.query;
        break;
      case ActionDecoratorTypes.Param:
        this.act[dec.propertyKey] = this.ctx.req.params;
        break;
      case ActionDecoratorTypes.Header:
        this.act[dec.propertyKey] = this.ctx.req.headers;
        break;
      case ActionDecoratorTypes.Body:
        this.act[dec.propertyKey] = this.ctx.req.body;
        break;
    }
  }
}
