import * as nats from "nats";
import "./startup";

declare module "@halsp/core" {
  interface Request {
    get headers(): nats.MsgHdrs;
  }
  interface Response {
    get headers(): nats.MsgHdrs;
  }
}

export { MicroNatsOptions } from "./options";
