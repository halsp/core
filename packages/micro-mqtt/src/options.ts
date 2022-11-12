import type mqtt from "mqtt";

export interface MicroMqttOptions extends mqtt.IClientOptions {
  subscribeOptions?: mqtt.IClientSubscribeOptions;
  publishOptions?: mqtt.IClientPublishOptions;
  prefix?: string;
}
