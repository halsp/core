import { parseBuffer } from "@ipare/micro";
import type mqtt from "mqtt";
import { MicroClient } from "./base";

export interface MicroMqttClientOptions extends mqtt.IClientOptions {
  subscribeOptions?: mqtt.IClientSubscribeOptions;
  publishOptions?: mqtt.IClientPublishOptions;
  prefix?: string;
  sendTimeout?: number;
}

export class MicroMqttClient extends MicroClient {
  constructor(protected readonly options: MicroMqttClientOptions = {}) {
    super();
  }

  #tasks = new Map<
    string,
    (err?: string, data?: any, packet?: mqtt.IPublishPacket) => void
  >();

  protected client?: mqtt.MqttClient;
  private connectResolve?: (err: void) => void;
  protected get prefix() {
    return this.options.prefix ?? "";
  }

  async connect() {
    this.#close(true);

    const opt: any = { ...this.options };
    delete opt.host;
    opt.port = this.options.port ?? 1883;
    opt.services = this.options.host ?? "localhost";

    await new Promise<void>((resolve) => {
      this.connectResolve = resolve;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mqttPkg = require("mqtt");
      this.client = mqttPkg.connect(this.options) as mqtt.MqttClient;
      this.client.on("connect", () => {
        resolve();
      });
      this.client.on("error", (err) => {
        this["logger"]?.error(err);
        resolve();
      });
    });

    const client = this.client as mqtt.MqttClient;
    client.on(
      "message",
      (topic: string, payload: Buffer, publishPacket: mqtt.IPublishPacket) => {
        parseBuffer(payload, (packet) => {
          const id = packet.id;
          const callback = this.#tasks.get(id);
          if (callback) {
            callback(
              packet.error,
              packet.data ?? packet.response,
              publishPacket
            );
            this.#tasks.delete(id);
          }
        });
      }
    );
  }

  #close(force = false) {
    if (this.connectResolve) {
      this.connectResolve();
      this.connectResolve = undefined;
    }

    this.client?.end(force);
    this.client?.removeAllListeners();
  }

  /**
   * for @ipare/inject
   */
  async dispose() {
    this.#close();
  }

  async send<T = any>(
    pattern: string,
    data: any,
    timeout?: number
  ): Promise<{
    data?: T;
    error?: string;
    packet?: mqtt.IPublishPacket;
  }> {
    if (!this.client?.connected) {
      return {
        error: "The connection is not connected",
      };
    }

    pattern = this.prefix + pattern;
    const packet = super.createPacket(pattern, data, true);

    const client = this.client;
    return new Promise((resolve) => {
      const reply = pattern + "/" + packet.id;

      let timeoutInstance: NodeJS.Timeout | undefined;
      const sendTimeout = timeout ?? this.options.sendTimeout ?? 10000;
      if (sendTimeout != 0) {
        timeoutInstance = setTimeout(() => {
          timeoutInstance = undefined;
          client.unsubscribe(reply);
          resolve({
            error: "Send timeout",
          });
        }, sendTimeout);
      }

      if (this.options.subscribeOptions) {
        client.subscribe(reply, this.options.subscribeOptions);
      } else {
        client.subscribe(reply);
      }

      this.#tasks.set(
        packet.id,
        (error?: string, data?: any, publishPacket?: mqtt.IPublishPacket) => {
          if (timeoutInstance) {
            clearTimeout(timeoutInstance);
            timeoutInstance = undefined;
          }
          client.unsubscribe(reply);
          resolve({
            data,
            error,
            packet: publishPacket,
          });
        }
      );

      this.#sendPacket(packet);
    });
  }

  emit(pattern: string, data: any): void {
    if (!this.client?.connected) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const packet = super.createPacket(pattern, data, false);
    this.#sendPacket(packet);
  }

  #sendPacket(packet: any) {
    const json = JSON.stringify(packet);
    const str = `${json.length}#${json}`;

    const client = this.client as mqtt.MqttClient;
    if (this.options.publishOptions) {
      client.publish(packet.pattern, str, this.options.publishOptions);
    } else {
      client.publish(packet.pattern, str);
    }
  }
}
