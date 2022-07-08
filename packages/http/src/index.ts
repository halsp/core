import * as http from "http";
import "@sfajs/core";

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
