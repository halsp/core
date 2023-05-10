import "./startup";
import * as net from "net";

declare module "@halsp/core" {
  interface Context {
    get socket(): net.Socket;
  }
}

export { MicroTcpOptions } from "./options";
