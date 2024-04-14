import * as nats from "nats";
import { MicroNatsOptions } from "./options";
import "./startup";
import "@halsp/micro/server";

export { MicroNatsOptions };

declare module "@halsp/core" {
  interface Request {
    get headers(): nats.MsgHdrs;
  }
  interface Response {
    get headers(): nats.MsgHdrs;
  }

  interface Startup {
    useMicroNats(options?: MicroNatsOptions): this;

    listen(): Promise<nats.NatsConnection>;
    close(): Promise<void>;
  }
}
