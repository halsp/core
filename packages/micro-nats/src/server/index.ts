import { Context } from "@halsp/core";
import * as nats from "nats";
import { MicroNatsOptions } from "../options";
import "./startup";

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

    register(
      pattern: string,
      handler?: (ctx: Context) => Promise<void> | void
    ): this;
  }
}