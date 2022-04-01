import * as http from "http";
import "@sfajs/core";

import SfaHttp from "./sfa-http.startup";
import SfaHttps from "./sfa-https.startup";
import HttpBodyPraserStartup, {
  MultipartBody,
} from "./http-body-praser.startup";

declare module "@sfajs/core" {
  interface HttpContext {
    readonly httpReq: http.IncomingMessage;
    readonly httpRes: http.ServerResponse;
  }
}

export { SfaHttp, SfaHttps, HttpBodyPraserStartup, MultipartBody };
