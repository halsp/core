import * as http from "http";
import "@sfajs/core";

export { SfaHttp } from "./sfa-http.startup";
export { SfaHttps } from "./sfa-https.startup";
export {
  HttpBodyPraserStartup,
  MultipartBody,
} from "./http-body-praser.startup";

declare module "@sfajs/core" {
  interface HttpContext {
    readonly httpReq: http.IncomingMessage;
    readonly httpRes: http.ServerResponse;
  }
}
