import type nats from "nats";

export interface MicroNatsClientOptions extends nats.ConnectionOptions {
  host?: string;
  prefix?: string;
  sendTimeout?: number;
}
