import { ParameterObject } from "openapi3-ts";

export interface PropertyDecItem {
  propertyKey: string | symbol;
  key: keyof ParameterObject;
  value: any;
}
