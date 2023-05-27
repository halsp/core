import { Context } from "@halsp/core";
import type mqtt from "mqtt";
import { MicroMqttOptions } from "../options";
import "./startup";
import "@halsp/micro/dist/server";

declare module "@halsp/core" {
  interface Startup {
    useMicroMqtt(options?: MicroMqttOptions): this;

    listen(): Promise<mqtt.MqttClient>;
    close(): Promise<void>;

    register(
      pattern: string,
      handler?: (ctx: Context) => Promise<void> | void
    ): this;
  }

  interface Request {
    get packet(): mqtt.IPublishPacket;
  }
}

export { MicroMqttOptions } from "../options";
