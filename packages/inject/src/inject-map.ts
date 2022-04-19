import { HttpContext, ObjectConstructor } from "@sfajs/core";
import { InjectType } from "./inject-type";

export interface InjectMap<T extends object = any, U extends T = any> {
  readonly anestor:
    | ObjectConstructor<T>
    | string
    | ((ctx: HttpContext) => T | Promise<T>);
  readonly target: ObjectConstructor<U> | U;
  readonly type: InjectType;
}
