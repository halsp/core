import { InjectConstructor } from "./inject-decorator-parser";

export type InjectDecoratorRecordItem = {
  injectConstructor: InjectConstructor;
  value: any;
};
