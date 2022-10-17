import * as http from "http";

export { ServerStartup } from "./startup";
export { BodyPraserStartup, MultipartBody } from "./body-praser.startup";

declare module "@ipare/core" {
  interface Context {
    get httpReq(): http.IncomingMessage;
    get httpRes(): http.ServerResponse;
  }
}
