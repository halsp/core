import * as net from "net";

export interface MicroTcpOptions extends net.ServerOpts, net.ListenOptions {
  handle?: any;
}
