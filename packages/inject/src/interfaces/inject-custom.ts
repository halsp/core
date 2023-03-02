import { Context } from "@halsp/common";
import { InjectType } from "../inject-type";

export type InjectCustom<T = any> =
  | {
      readonly handler: (parent: any) => T | Promise<T>;
      readonly property: string | symbol;
      readonly parameterIndex?: number;
      readonly type: InjectType.Singleton;
    }
  | {
      readonly handler: (ctx: Context, parent: any) => T | Promise<T>;
      readonly property: string | symbol;
      readonly parameterIndex?: number;
      readonly type?: InjectType.Scoped | InjectType.Transient;
    };
