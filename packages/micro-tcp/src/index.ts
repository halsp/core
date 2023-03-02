import * as net from "net";

declare module "@halsp/core" {
  interface Context {
    get socket(): net.Socket;
  }
}

export { MicroTcpStartup } from "./startup";
export { MicroTcpOptions } from "./options";
