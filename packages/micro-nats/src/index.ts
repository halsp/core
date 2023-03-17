import * as nats from "nats";

declare module "@halsp/core" {
  interface Request {
    get headers(): nats.MsgHdrs;
  }
  interface Response {
    get headers(): nats.MsgHdrs;
  }
}

export { MicroNatsOptions } from "./options";
export { MicroNatsStartup } from "./startup";
