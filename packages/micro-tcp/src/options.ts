import * as net from "net";

export interface MicroTcpOptions extends net.ServerOpts, net.ListenOptions {
  handle?: any;
}

export interface MicroTcpClientOptions {
  host?: string;
  port?: number;
  prefix?: string;
  sendTimeout?: number;
}
