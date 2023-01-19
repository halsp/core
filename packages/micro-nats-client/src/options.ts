import type nats from "nats";

export interface MicroNatsClientOptions extends nats.ConnectionOptions {
  prefix?: string;
  subscribeOptions?: Omit<nats.SubscriptionOptions, "callback">;
  sendTimeout?: number;
}
