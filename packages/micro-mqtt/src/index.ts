import * as mqtt from "mqtt";

declare module "@ipare/core" {
  interface Request {
    get packet(): mqtt.IPublishPacket;
  }
}

export { MicroMqttClientOptions, MicroMqttOptions } from "./options";
export { MicroMqttStartup } from "./startup";
export { MicroMqttClient } from "./client";
export { MicroMqttConnection } from "./connection";
