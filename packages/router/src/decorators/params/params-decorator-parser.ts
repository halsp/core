import { HttpContext } from "@sfajs/core";
import Action from "../../action";
import { ROUTE_ARGS_METADATA } from "../../constant";
import { ParamsDecoratorValue } from "./params-decorator-value";
import { ParamsTypes } from "./params-types";

export class ParamsDecoratorParser {
  constructor(
    private readonly ctx: HttpContext,
    private readonly act: Action
  ) {}

  public get action() {
    this.parse();
    return this.act;
  }

  private parse() {
    const args =
      (Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        this.act
      ) as ParamsDecoratorValue[]) ?? [];
    args.forEach((arg) => {
      this.setProperty(arg);
    });
  }

  private setProperty(decValue: ParamsDecoratorValue) {
    switch (decValue.type) {
      case ParamsTypes.QUERY:
        this.act[decValue.propertyKey] = this.ctx.req.query;
        break;
      case ParamsTypes.PARAM:
        this.act[decValue.propertyKey] = this.ctx.req.params;
        break;
      case ParamsTypes.HEADERS:
        this.act[decValue.propertyKey] = this.ctx.req.headers;
        break;
      case ParamsTypes.BODY:
        this.act[decValue.propertyKey] = this.ctx.req.body;
        break;
    }
  }
}
