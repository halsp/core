import * as net from "net";

declare module "@ipare/core" {
  interface Context {
    get socket(): net.Socket;
  }
}

export { MicroTcpStartup } from "./startup";
export { MicroTcpOptions } from "./options";
