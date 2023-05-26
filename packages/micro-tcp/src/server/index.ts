import "./startup";
import * as net from "net";
import { MicroTcpOptions } from "../options";

declare module "@halsp/core" {
  interface Startup {
    useMicroTcp(options?: MicroTcpOptions): this;

    listen(): Promise<net.Server>;
    close(): Promise<void>;

    register(
      pattern: string,
      handler?: (ctx: Context) => Promise<void> | void
    ): this;
  }

  interface Context {
    get socket(): net.Socket;
  }
}
