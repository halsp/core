import { ActionDecoratorTypes } from "./action-decorator-types";

export interface ActionDecoratorValue {
  propertyKey: string;
  type: ActionDecoratorTypes;
  data?: any;
}
