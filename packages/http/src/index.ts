import * as http from "http";
import "@ipare/core";

export { HttpStartup } from "./http.startup";
export { BodyPraserStartup, MultipartBody } from "./body-praser.startup";

declare module "@ipare/core" {
  interface HttpContext {
    get httpReq(): http.IncomingMessage;
    get httpRes(): http.ServerResponse;
  }
}
