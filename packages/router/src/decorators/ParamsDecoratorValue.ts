import { RouteParamTypes } from "./RouteParamTypes";

export interface ParamsDecoratorValue {
  propertyKey: string;
  type: RouteParamTypes;
  data?: any;
}
