import * as http from "http";

export { NativeStartup } from "./startup";

declare module "@halsp/http" {
  interface HttpContext {
    get reqStream(): http.IncomingMessage;
    get resStream(): http.ServerResponse;
  }
}
