import * as http from "http";
import "@ipare/core";

export { HttpStartup } from "./http.startup";
export { HttpsStartup } from "./https.startup";
export { BodyPraserStartup, MultipartBody } from "./http-body-praser.startup";

declare module "@ipare/core" {
  interface HttpContext {
    get httpReq(): http.IncomingMessage;
    get httpRes(): http.ServerResponse;
  }
}
