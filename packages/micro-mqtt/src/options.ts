import type mqtt from "mqtt";

export interface MicroMqttOptions extends mqtt.IClientOptions {
  subscribeOptions?: mqtt.IClientSubscribeOptions;
  publishOptions?: mqtt.IClientPublishOptions;
}

export interface MicroMqttClientOptions extends mqtt.IClientOptions {
  subscribeOptions?: mqtt.IClientSubscribeOptions;
  publishOptions?: mqtt.IClientPublishOptions;
  prefix?: string;
  sendTimeout?: number;
}
