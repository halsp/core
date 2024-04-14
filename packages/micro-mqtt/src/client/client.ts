import { IMicroClient } from "@halsp/micro/client";
import { parseJsonBuffer } from "@halsp/micro/common.internal";
import * as mqtt from "mqtt";
import { MicroMqttClientOptions } from "./options";

export class MicroMqttClient extends IMicroClient {
  constructor(protected readonly options: MicroMqttClientOptions = {}) {
    super();
  }

  #tasks = new Map<string, (err?: string, data?: any) => void>();

  protected client?: mqtt.MqttClient;
  #connectResolve?: (err: void) => void;
  protected get prefix() {
    return this.options.prefix ?? "";
  }

  protected async connect() {
    const opt: MicroMqttClientOptions = { ...this.options };
    if (!("servers" in this.options) && !("port" in this.options)) {
      opt.port = 1883;
    }

    await new Promise<void>((resolve, reject) => {
      this.#connectResolve = resolve;
      this.client = mqtt.connect(opt) as mqtt.MqttClient;

      let handled = false;
      const handler = (cb: () => void) => {
        if (handled) return;
        handled = true;
        cb();
      };
      this.client.on("connect", () => {
        handler(() => resolve());
      });
      this.client.on("error", (err) => {
        handler(() => reject(err));
      });
    });

    const client = this.client as mqtt.MqttClient;
    client.on("message", (topic: string, payload: Buffer) => {
      const packet = parseJsonBuffer(payload);
      const id = packet.id;
      const callback = this.#tasks.get(id);
      if (callback) {
        callback(packet.error, this.getDataFromReturnPacket(packet));
        this.#tasks.delete(id);
      }
    });
  }

  private getDataFromReturnPacket(packet: any) {
    return packet.data ?? packet.response;
  }

  /**
   * for @halsp/inject
   */
  async dispose(force?: boolean) {
    if (this.#connectResolve) {
      this.#connectResolve();
      this.#connectResolve = undefined;
    }

    if (this.client) {
      const client = this.client;
      client.removeAllListeners();
      await new Promise<void>((resolve, reject) => {
        client.end(force, {}, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }

  async send<T = any>(
    pattern: string,
    data: any,
    options?: Partial<mqtt.IClientSubscribeOptions> & {
      timeout?: number;
    },
  ): Promise<T> {
    if (!this.client?.connected) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const packet = super.createServerPacket(pattern, data, true);

    const client = this.client;
    return new Promise((resolve, reject) => {
      const reply = pattern + "/" + packet.id;

      let timeoutInstance: NodeJS.Timeout | undefined;
      const sendTimeout = options?.timeout ?? this.options.sendTimeout ?? 10000;
      if (sendTimeout != 0) {
        timeoutInstance = setTimeout(() => {
          timeoutInstance = undefined;
          client.unsubscribe(reply);
          reject(new Error("Send timeout"));
        }, sendTimeout);
      }

      const subscribeOptions = {
        ...this.options.subscribeOptions,
        ...options,
      } as mqtt.IClientSubscribeOptions;
      client.subscribe(reply, subscribeOptions);

      this.#tasks.set(packet.id, (error?: string, data?: any) => {
        if (timeoutInstance) {
          clearTimeout(timeoutInstance);
          timeoutInstance = undefined;
        }
        client.unsubscribe(reply);
        if (error) {
          reject(new Error(error));
        } else {
          resolve(data);
        }
      });

      this.#sendPacket(packet);
    });
  }

  emit(pattern: string, data: any): void {
    if (!this.client?.connected) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const packet = super.createServerPacket(pattern, data, false);
    this.#sendPacket(packet);
  }

  #sendPacket(packet: any) {
    const json = JSON.stringify(packet);

    const client = this.client as mqtt.MqttClient;
    if (this.options.publishOptions) {
      client.publish(packet.pattern, json, this.options.publishOptions);
    } else {
      client.publish(packet.pattern, json);
    }
  }
}
