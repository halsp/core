import * as http from "http";

export { NativeStartup } from "./startup";

declare module "@ipare/core" {
  interface Context {
    get reqStream(): http.IncomingMessage;
    get resStream(): http.ServerResponse;
  }
}
