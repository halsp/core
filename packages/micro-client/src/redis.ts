import { parseBuffer } from "@ipare/micro";
import type redis from "redis";
import { MicroClient } from "./base";

export interface MicroRedisClientOptions<
  M extends redis.RedisModules = redis.RedisModules,
  F extends redis.RedisFunctions = redis.RedisFunctions,
  S extends redis.RedisScripts = redis.RedisScripts
> extends Omit<redis.RedisClientOptions<M, F, S>, "url"> {
  host?: string;
  port?: number;
  prefix?: string;
  sendTimeout?: number;
}

export class MicroRedisClient extends MicroClient {
  constructor(protected readonly options: MicroRedisClientOptions = {}) {
    super();
  }

  protected pub?: redis.RedisClientType;
  protected sub?: redis.RedisClientType;
  protected get prefix() {
    return this.options.prefix ?? "";
  }

  async connect() {
    await this.#close();

    const host = this.options.host ?? "localhost";
    const port = this.options.port ?? 6379;
    const opt: any = { ...this.options };
    delete opt.host;
    delete opt.port;
    opt.url = `redis://${host}:${port}`;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const redisPkg = require("redis");
    const pub = redisPkg.createClient(opt) as redis.RedisClientType;
    const sub = redisPkg.createClient(opt) as redis.RedisClientType;

    this.pub = pub;
    this.sub = sub;
    await Promise.all([pub.connect(), sub.connect()]);
  }

  async #close() {
    async function disconnect(redis?: redis.RedisClientType) {
      if (redis?.isReady && redis.isOpen) {
        await redis.disconnect();
      }
    }
    await disconnect(this.pub);
    this.pub = undefined;
    await disconnect(this.sub);
    this.sub = undefined;
  }

  /**
   * for @ipare/inject
   */
  async dispose() {
    await this.#close();
  }

  async send<T = any>(
    pattern: string,
    data: any,
    timeout?: number
  ): Promise<{
    data?: T;
    error?: string;
  }> {
    if (!this.sub?.isReady || !this.pub?.isReady) {
      return {
        error: "The connection is not connected",
      };
    }

    pattern = this.prefix + pattern;
    const packet = super.createPacket(pattern, data, true);
    const reply = pattern + "." + packet.id;

    const sub = this.sub as Exclude<typeof this.pub, undefined>;
    return new Promise(async (resolve) => {
      let timeoutInstance: NodeJS.Timeout | undefined;
      const sendTimeout = timeout ?? this.options.sendTimeout ?? 10000;
      if (sendTimeout != 0) {
        timeoutInstance = setTimeout(() => {
          sub.unsubscribe(reply);
          resolve({
            error: "Send timeout",
          });
        }, sendTimeout);
      }

      await sub.subscribe(
        reply,
        (buffer) => {
          if (timeoutInstance) {
            clearTimeout(timeoutInstance);
            timeoutInstance = undefined;
          }
          sub.unsubscribe(reply);

          parseBuffer(buffer, (packet) => {
            resolve({
              data: packet.data ?? packet.response,
              error: packet.error,
            });
          });
        },
        true
      );
      this.#sendPacket(packet);
    });
  }

  emit(pattern: string, data: any): void {
    if (!this.pub?.isReady) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const packet = super.createPacket(pattern, data, false);
    this.#sendPacket(packet);
  }

  #sendPacket(packet: any) {
    const json = JSON.stringify(packet);
    const str = `${json.length}#${json}`;

    const pub = this.pub as redis.RedisClientType;
    pub.publish(packet.pattern, str);
  }
}
