import { ObjectConstructor } from "@sfajs/core";
import { InjectTypes } from "./inject-types";

export interface InjectMap<T extends object = any, U extends T = any> {
  readonly anestor: ObjectConstructor<T>;
  readonly target: ObjectConstructor<U> | U;
  readonly type: InjectTypes;
}
