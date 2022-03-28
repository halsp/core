import { ParamsTypes } from "./params-types";

export interface ParamsDecoratorValue {
  propertyKey: string;
  type: ParamsTypes;
  data?: any;
}
