import { MicroClient, parseBuffer } from "@ipare/micro";
import { MicroMqttClientOptions } from "./options";
import { initMqttConnection, MicroMqttConnection } from "./connection";
import * as mqtt from "mqtt";

export class MicroMqttClient extends MicroClient {
  constructor(protected readonly options: MicroMqttClientOptions = {}) {
    super();
    initMqttConnection.bind(this)();
  }

  #tasks = new Map<
    string,
    (err?: string, data?: any, packet?: mqtt.IPublishPacket) => void
  >();

  async connect() {
    await this.initClients();

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

  /**
   * for @ipare/inject
   */
  async dispose() {
    await this.closeClients();
  }

  async send<T = any>(
    pattern: string,
    data: any
  ): Promise<{
    data?: T;
    error?: string;
    packet?: mqtt.IPublishPacket;
  }> {
    const packet = super.createPacket(pattern, data, true);

    const client = this.client as mqtt.MqttClient;
    return new Promise(async (resolve) => {
      const reply = this.prefix + pattern + "/" + packet.id;
      if (this.options.subscribeOptions) {
        client.subscribe(reply, this.options.subscribeOptions);
      } else {
        client.subscribe(reply);
      }

      this.#tasks.set(
        packet.id,
        (error?: string, data?: any, publishPacket?: mqtt.IPublishPacket) => {
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
    const packet = super.createPacket(pattern, data, false);
    this.#sendPacket(packet);
  }

  #sendPacket(packet: any) {
    const json = JSON.stringify(packet);
    const str = `${json.length}#${json}`;
    this.client?.publish(this.prefix + packet.pattern, str);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MicroMqttClient
  extends MicroMqttConnection<MicroMqttClientOptions> {}
