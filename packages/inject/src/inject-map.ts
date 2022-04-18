import { ObjectConstructor } from "@sfajs/core";
import { InjectType } from "./inject-type";

export interface InjectMap<T extends object = any, U extends T = any> {
  readonly anestor: ObjectConstructor<T> | string;
  readonly target: ObjectConstructor<U> | U;
  readonly type: InjectType;
}
