import "@sfajs/core";
import { AliReq } from "./ali-req";
import { AliRes } from "./ali-res";

declare module "@sfajs/core" {
  interface HttpContext {
    readonly aliContext: any;
    readonly aliReq: AliReq;
    readonly aliRes: AliRes;
  }
}

export { AliReq } from "./ali-req";
export { AliRes } from "./ali-res";
export { SfaAlifunc } from "./sfa-ali-func";
export { cliConfig } from "./cli-config";
