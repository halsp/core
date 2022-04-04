import { ObjectConstructor } from "@sfajs/core";

export type InjectDecoratorRecordItem = {
  injectConstructor: ObjectConstructor;
  value: any;
};
