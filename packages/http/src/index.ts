import * as http from "http";
import "@sfajs/core";
import { HttpStartup } from "./http.startup";
import { HttpsStartup } from "./https.startup";

export { HttpStartup } from "./http.startup";
export { HttpsStartup } from "./https.startup";
export {
  HttpBodyPraserStartup,
  MultipartBody,
} from "./http-body-praser.startup";

declare module "@sfajs/core" {
  interface HttpContext {
    get httpReq(): http.IncomingMessage;
    get httpRes(): http.ServerResponse;
  }
}

/**
 * @deprecated use HttpStartup
 */
export class SfaHttp extends HttpStartup {}

/**
 * @deprecated use HttpsStartup
 */
export class SfaHttps extends HttpsStartup {}
