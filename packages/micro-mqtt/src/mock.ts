import { MicroMqttConnection } from "./connection";
import * as mqtt from "mqtt";

export function createMockMqtt() {
  let connected = false;
  const topics: string[] = [];
  const events: Record<
    string,
    ((topic: string, payload: Buffer, packet: mqtt.IPublishPacket) => void)[]
  > = {};

  const publish = (
    topic: string,
    data: string | Buffer,
    options?: mqtt.IClientPublishOptions
  ) => {
    const cbs = events["message"];
    if (!cbs) return;
    cbs.forEach((cb) => {
      cb(topic, Buffer.isBuffer(data) ? data : Buffer.from(data, "utf-8"), {
        ...options,
        payload: data,
        topic,
        cmd: "publish",
      } as mqtt.IPublishPacket);
    });
  };

  return {
    subscribe: (topic: string) => {
      topics.push(topic);
    },
    unsubscribe: (topic: string) => {
      if (topics.includes(topic)) {
        topics.splice(topics.indexOf(topic), 1);
      }
    },
    publish: publish,
    on: (
      event: string,
      callback: (
        topic: string,
        payload: Buffer,
        packet: mqtt.IPublishPacket
      ) => void
    ) => {
      if (events[event]) {
        events[event].push(callback);
      } else {
        events[event] = [callback];
      }
    },
    connect() {
      connected = true;
    },
    end() {
      connected = false;
    },
    connected() {
      return connected;
    },
    disconnected() {
      return !connected;
    },
  };
}

export function mockConnection(this: MicroMqttConnection) {
  this.initClients = async function () {
    const mqtt = createMockMqtt();

    (this as any).client = mqtt;
    mqtt.connect();
  };
  return this;
}

export function mockConnectionFrom(
  this: MicroMqttConnection,
  target: MicroMqttConnection
) {
  this.initClients = async function () {
    (this as any).client = (target as any).client;
  };
  return this;
}
