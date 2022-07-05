import { HttpContext } from "@sfajs/core";
import { InjectType } from "../inject-type";

export type InjectCustom<T = any> =
  | {
      readonly handler: (parent: any) => T | Promise<T>;
      readonly property: string | symbol;
      readonly parameterIndex?: number;
      readonly type: InjectType.Singleton;
    }
  | {
      readonly handler: (ctx: HttpContext, parent: any) => T | Promise<T>;
      readonly property: string | symbol;
      readonly parameterIndex?: number;
      readonly type?: InjectType.Scoped | InjectType.Transient;
    };
