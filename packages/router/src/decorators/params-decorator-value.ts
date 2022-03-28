import { RouteParamTypes } from "./route-param-types";

export interface ParamsDecoratorValue {
  propertyKey: string;
  type: RouteParamTypes;
  data?: any;
}
