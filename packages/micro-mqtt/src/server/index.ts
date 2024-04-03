import type mqtt from "mqtt";
import { MicroMqttOptions } from "../options";
import "./startup";
import "@halsp/micro/server";

declare module "@halsp/core" {
  interface Startup {
    useMicroMqtt(options?: MicroMqttOptions): this;

    listen(): Promise<mqtt.MqttClient>;
    close(): Promise<void>;
  }

  interface Request {
    get packet(): mqtt.IPublishPacket;
  }
}

export { MicroMqttOptions } from "../options";
