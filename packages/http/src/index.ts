import * as http from "http";
import "sfa";

import { MultipartBody } from "./HttpStartup";
import SfaHttp from "./SfaHttp";
import SfaHttps from "./SfaHttps";

declare module "sfa" {
  interface HttpContext {
    readonly httpReq: http.IncomingMessage;
    readonly httpRes: http.ServerResponse;
  }
}

export { SfaHttp, SfaHttps, MultipartBody };
