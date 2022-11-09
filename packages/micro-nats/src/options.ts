import * as nats from "nats";

export interface MicroNatsOptions
  extends Omit<nats.ConnectionOptions, "services"> {
  host?: string;
  prefix?: string;
}

export interface MicroNatsClientOptions
  extends Omit<nats.ConnectionOptions, "services"> {
  host?: string;
  prefix?: string;
  sendTimeout?: number;
}
