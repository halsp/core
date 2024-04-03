import "./startup";
import * as net from "net";
import { MicroTcpOptions } from "../options";
import "@halsp/micro/server";

declare module "@halsp/core" {
  interface Startup {
    useMicroTcp(options?: MicroTcpOptions): this;

    listen(): Promise<net.Server>;
    close(): Promise<void>;
  }

  interface Context {
    get socket(): net.Socket;
  }
}
