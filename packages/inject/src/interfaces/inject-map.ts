import { HttpContext, ObjectConstructor } from "@ipare/core";
import { InjectType } from "../inject-type";

export interface InjectMap<T extends object = any, U extends T = any> {
  readonly anestor:
    | ObjectConstructor<T>
    | string
    | ((ctx: HttpContext) => T | Promise<T>);
  readonly target: ObjectConstructor<U> | U;
  readonly type: InjectType;
}
