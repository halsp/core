import * as nats from "nats";

export interface MicroNatsOptions extends nats.ConnectionOptions {
  host?: string;
}
