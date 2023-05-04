import * as http from "http";

declare module "@halsp/core" {
  interface Context {
    get reqStream(): http.IncomingMessage;
    get resStream(): http.ServerResponse;
  }
}
