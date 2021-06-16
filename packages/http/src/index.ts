import * as http from "http";
import "sfa";

import SfaHttp from "./SfaHttp";
import SfaHttps from "./SfaHttps";
import HttpBodyPraserStartup, { MultipartBody } from "./HttpBodyPraserStartup";

declare module "sfa" {
  interface HttpContext {
    readonly httpReq: http.IncomingMessage;
    readonly httpRes: http.ServerResponse;
  }
}

export { SfaHttp, SfaHttps, HttpBodyPraserStartup, MultipartBody };
