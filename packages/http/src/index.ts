import * as http from "http";
import "sfa";

import { MultipartBody } from "./BaseHttpStartup";
import SfaHttp from "./SfaHttp";
import SfaHttps from "./SfaHttps";
import BaseHttpStartup from "./BaseHttpStartup";

declare module "sfa" {
  interface HttpContext {
    readonly httpReq: http.IncomingMessage;
    readonly httpRes: http.ServerResponse;
  }
}

export { SfaHttp, SfaHttps, BaseHttpStartup, MultipartBody };
