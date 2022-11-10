import * as http from "http";

export { HttpServerStartup } from "./startup";

declare module "@ipare/core" {
  interface Context {
    get serverReq(): http.IncomingMessage;
    get serverRes(): http.ServerResponse;
  }
}
