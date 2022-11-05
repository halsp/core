import { MicroStartup } from "../";
import { MicroRedisOptions } from "./options";
import * as redis from "redis";
import { REDIS_DEFAULT_CHANNEL } from "../constant";
import { closeClients, createClients } from "./connection";

export class MicroRedisStartup extends MicroStartup {
  constructor(private readonly options: MicroRedisOptions = {}) {
    super();
  }

  #pub?: redis.RedisClientType<any, any, any>;
  #sub?: redis.RedisClientType<any, any, any>;

  get #channel() {
    return this.options.channel ?? REDIS_DEFAULT_CHANNEL;
  }
  get #replyChanlel() {
    return this.#channel + ".reply";
  }

  #handler(buffer: Buffer) {
    this.handleMessage(buffer, async ({ result }) => {
      await this.#pub?.publish(this.#replyChanlel, result);
    });
  }

  async listen() {
    await this.close();

    const { pub, sub } = createClients(this.options);
    this.#pub = pub;
    this.#sub = sub;

    await Promise.all([this.#pub.connect(), this.#sub.connect()]);
    await this.#sub.subscribe(this.#channel, this.#handler.bind(this), true);
    return { sub: this.#sub, pub: this.#pub };
  }

  async close() {
    await this.#sub?.unsubscribe(this.#channel);
    await closeClients(this.#sub, this.#pub);
    this.#pub = undefined;
    this.#sub = undefined;
  }
}
