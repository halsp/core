import { MicroClient, PatternType } from "../";
import { MicroRedisClientOptions } from "./options";
import { parseBuffer } from "../parser";
import * as redis from "redis";
import { REDIS_DEFAULT_CHANNEL } from "../constant";
import { closeClients, createClients } from "./connection";

export class MicroRedisClient extends MicroClient {
  constructor(private readonly options: MicroRedisClientOptions) {
    super();
  }

  #pub?: redis.RedisClientType<any, any, any>;
  #sub?: redis.RedisClientType<any, any, any>;
  #tasks = new Map<string, (data: any) => void>();

  get #channel() {
    return this.options.channel ?? REDIS_DEFAULT_CHANNEL;
  }
  get #replyChanlel() {
    return this.#channel + ".reply";
  }

  async connect() {
    await this.#close();

    const { pub, sub } = createClients(this.options);
    this.#pub = pub;
    this.#sub = sub;

    await Promise.all([this.#pub.connect(), this.#sub.connect()]);

    await this.#sub.subscribe(
      this.#replyChanlel,
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
    await this.#sub?.unsubscribe(this.#replyChanlel);
    await closeClients(this.#sub, this.#pub);
    this.#pub = undefined;
    this.#sub = undefined;
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
    this.#pub?.publish(this.#channel, str);
  }
}
