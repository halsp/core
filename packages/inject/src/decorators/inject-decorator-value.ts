import { InjectDecoratorTypes } from "./inject-decorator-types";

export interface InjectDecoratorValue {
  propertyKey: string;
  type: InjectDecoratorTypes;
}
