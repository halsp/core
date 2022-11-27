import type nats from "nats";

export interface MicroNatsClientOptions extends nats.ConnectionOptions {
  prefix?: string;
  sendTimeout?: number;
}
