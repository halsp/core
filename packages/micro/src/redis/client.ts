import { MicroClient, PatternType } from "../";
import { MicroRedisClientOptions } from "./options";
import { parseBuffer } from "../parser";
import { initRedisConnection, RedisConnection } from "./connection";

export class MicroRedisClient extends MicroClient {
  constructor(options: MicroRedisClientOptions) {
    super();
    initRedisConnection.bind(this)(options);
  }

  #tasks = new Map<string, (data: any) => void>();

  async connect() {
    await this.#close();
    await this.initClients();

    const sub = this.sub as Exclude<typeof this.pub, undefined>;
    await sub.subscribe(
      this.replyChanlel,
      (buffer) => {
        parseBuffer(buffer, (packet) => this.#handleResponse(packet));
      },
      true
    );
  }

  #handleResponse(packet: any) {
    const id = packet.id;
    const callback = this.#tasks.get(id);
    if (callback) {
      callback(packet.data ?? packet.response);
      this.#tasks.delete(id);
    }
  }

  async #close() {
    await this.sub?.unsubscribe(this.replyChanlel);
    await this.closeClients();
  }

  /**
   * for @ipare/inject
   */
  async dispose() {
    await this.#close();
  }

  send<T = any>(pattern: PatternType, data: any): Promise<T> {
    const packet = super.createPacket(pattern, data, true);

    return new Promise<T>((resolve) => {
      this.#tasks.set(packet.id, (data: any) => {
        resolve(data);
      });
      this.#sendPacket(packet);
    });
  }

  emit(pattern: PatternType, data: any): void {
    const packet = super.createPacket(pattern, data, false);
    this.#sendPacket(packet);
  }

  #sendPacket(packet: any) {
    const json = JSON.stringify(packet);
    const str = `${json.length}#${json}`;
    this.pub?.publish(this.channel, str);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MicroRedisClient extends RedisConnection {}
