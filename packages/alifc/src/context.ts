import { AliReq } from "./ali-req";
import { AliRes } from "./ali-res";

declare module "@halsp/core" {
  interface Context {
    get aliContext(): any;
    get aliReq(): AliReq;
    get aliRes(): AliRes;
    get reqStream(): AliReq;
  }
  interface Request {
    get aliReq(): AliReq;
  }
  interface Response {
    get aliRes(): AliRes;
  }
}
