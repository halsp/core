import "@sfajs/core";
import { AliReq } from "./ali-req";
import { AliRes } from "./ali-res";

declare module "@sfajs/core" {
  interface HttpContext {
    get aliContext(): any;
    get aliReq(): AliReq;
    get aliRes(): AliRes;
  }
  interface SfaRequest {
    get aliReq(): AliReq;
  }
  interface SfaResponse {
    get aliRes(): AliRes;
  }
}

export { AliReq } from "./ali-req";
export { AliRes } from "./ali-res";
export { SfaAlifunc } from "./sfa-alifunc";
export { cliConfig } from "./cli-config";
