import type mqtt from "mqtt";

declare module "@ipare/core" {
  interface Request {
    get packet(): mqtt.IPublishPacket;
  }
}

export { MicroMqttOptions } from "./options";
export { MicroMqttStartup } from "./startup";
