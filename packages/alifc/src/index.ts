import "@ipare/core";
import "@ipare/http";
import { AliReq } from "./ali-req";
import { AliRes } from "./ali-res";

declare module "@ipare/core" {
  interface Context {
    get aliContext(): any;
    get aliReq(): AliReq;
    get aliRes(): AliRes;
  }
}

declare module "@ipare/http" {
  interface Request {
    get aliReq(): AliReq;
  }
  interface Response {
    get aliRes(): AliRes;
  }
}

export { AliReq } from "./ali-req";
export { AliRes } from "./ali-res";
export { AlifcStartup } from "./alifc-startup";
export { cliConfigHook } from "./cli-config";
