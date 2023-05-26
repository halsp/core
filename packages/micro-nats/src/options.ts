import * as nats from "nats";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MicroNatsOptions extends nats.ConnectionOptions {}

export interface MicroNatsClientOptions extends nats.ConnectionOptions {
  prefix?: string;
  subscribeOptions?: Omit<nats.SubscriptionOptions, "callback">;
  sendTimeout?: number;
}
