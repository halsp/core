import * as nats from "nats";

export interface MicroNatsOptions
  extends Omit<nats.ConnectionOptions, "services"> {
  host?: string;
}
