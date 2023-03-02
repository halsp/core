import type mqtt from "mqtt";
import "@halsp/core";

declare module "@halsp/core" {
  interface Request {
    get packet(): mqtt.IPublishPacket;
  }
}

export { MicroMqttOptions } from "./options";
export { MicroMqttStartup } from "./startup";
export { matchTopic } from "./topic";
