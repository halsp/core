import * as mqtt from "mqtt";

export interface MicroMqttOptions extends mqtt.IClientOptions {
  subscribeOptions?: mqtt.IClientSubscribeOptions;
  publishOptions?: mqtt.IClientPublishOptions;
  retryAttempts?: number;
  retryDelay?: number;
  prefix?: string;
}

export interface MicroMqttClientOptions extends mqtt.IClientOptions {
  subscribeOptions?: mqtt.IClientSubscribeOptions;
  publishOptions?: mqtt.IClientPublishOptions;
  prefix?: string;
}
