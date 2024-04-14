import type mqtt from "mqtt";

export interface MicroMqttClientOptions extends mqtt.IClientOptions {
  subscribeOptions?: mqtt.IClientSubscribeOptions;
  publishOptions?: mqtt.IClientPublishOptions;
  prefix?: string;
  sendTimeout?: number;
}
