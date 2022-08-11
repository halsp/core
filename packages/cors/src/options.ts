import { HttpContext } from "@ipare/core";

export interface Options {
  allowMethods?: string | string[];
  origin?: string | ((ctx: HttpContext) => Promise<string> | string);
  exposeHeaders?: string | string[];
  allowHeaders?: string | string[];
  credentials?: boolean | ((ctx: HttpContext) => Promise<boolean> | boolean);
  maxAge?: number;
  privateNetworkAccess?: boolean;
  secureContext?: boolean;
}
