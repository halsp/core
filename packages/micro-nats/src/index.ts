import * as nats from "nats";

declare module "@ipare/core" {
  interface Request {
    get headers(): nats.MsgHdrs;
  }
  interface Response {
    get headers(): nats.MsgHdrs;
  }
}

export { MicroNatsClientOptions, MicroNatsOptions } from "./options";
export { MicroNatsStartup } from "./startup";
export { MicroNatsClient } from "./client";
export { MicroNatsConnection } from "./connection";
