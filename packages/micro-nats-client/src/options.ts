import type nats from "nats";

export interface MicroNatsClientOptions
  extends Omit<nats.ConnectionOptions, "services"> {
  host?: string;
  prefix?: string;
  sendTimeout?: number;
}
