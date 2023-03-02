import type mqtt from "mqtt";
import "@halsp/common";

declare module "@halsp/common" {
  interface Request {
    get packet(): mqtt.IPublishPacket;
  }
}

export { MicroMqttOptions } from "./options";
export { MicroMqttStartup } from "./startup";
export { matchTopic } from "./topic";
