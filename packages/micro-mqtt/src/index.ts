import type mqtt from "mqtt";
import "@ipare/core";

declare module "@ipare/core" {
  interface Request {
    get packet(): mqtt.IPublishPacket;
  }
}

export { MicroMqttOptions } from "./options";
export { MicroMqttStartup } from "./startup";
export { matchTopic } from "./topic";
