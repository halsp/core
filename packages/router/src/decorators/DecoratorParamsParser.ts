import { HttpContext } from "@sfajs/core";
import Action from "../Action";
import { ROUTE_ARGS_METADATA } from "../Constant";
import { ParamsDecoratorValue } from "./ParamsDecoratorValue";
import { RouteParamTypes } from "./RouteParamTypes";

export class DecoratorParamsParser {
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
      case RouteParamTypes.QUERY:
        this.act[decValue.propertyKey] = this.ctx.req.query;
        break;
      case RouteParamTypes.PARAM:
        this.act[decValue.propertyKey] = this.ctx.req.params;
        break;
      case RouteParamTypes.HEADERS:
        this.act[decValue.propertyKey] = this.ctx.req.headers;
        break;
      case RouteParamTypes.BODY:
        this.act[decValue.propertyKey] = this.ctx.req.body;
        break;
    }
  }
}
