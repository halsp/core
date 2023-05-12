import type mqtt from "mqtt";
import "./startup";

declare module "@halsp/core" {
  interface Request {
    get packet(): mqtt.IPublishPacket;
  }
}

export { MicroMqttOptions } from "./options";
export { matchTopic } from "./topic";
