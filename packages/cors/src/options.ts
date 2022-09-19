import { Context } from "@ipare/core";

export interface Options {
  allowMethods?: string | string[];
  origin?: string | ((ctx: Context) => Promise<string> | string);
  exposeHeaders?: string | string[];
  allowHeaders?: string | string[];
  credentials?: boolean | ((ctx: Context) => Promise<boolean> | boolean);
  maxAge?: number;
  privateNetworkAccess?: boolean;
  secureContext?: boolean;
}
