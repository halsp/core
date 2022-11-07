import * as nats from "nats";

declare module "@ipare/core" {
  interface Request {
    get headers(): nats.MsgHdrsImpl;
  }
  interface Response {
    get headers(): Omit<nats.MsgHdrsImpl, "status">;
  }
}

export { MicroNatsClientOptions, MicroNatsOptions } from "./options";
export { MicroNatsStartup } from "./startup";
export { MicroNatsClient } from "./client";
export { MicroNatsConnection } from "./connection";
