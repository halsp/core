import "@sfajs/core";
import { AliReq } from "./ali-req";
import { AliRes } from "./ali-res";
import { AlifuncStartup } from "./alifunc-startup";

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
export { AlifuncStartup } from "./alifunc-startup";
export { cliConfig } from "./cli-config";

/**
 * @deprecated use AlifuncStartup
 */
export class SfaAlifunc extends AlifuncStartup {}
