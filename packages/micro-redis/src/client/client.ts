import { ClientPacket, parseJsonBuffer, IMicroClient } from "@halsp/micro";
import * as redis from "redis";
import { MicroRedisClientOptions } from "../options";

export class MicroRedisClient extends IMicroClient {
  constructor(protected readonly options: MicroRedisClientOptions = {}) {
    super();
  }

  protected pub?: redis.RedisClientType;
  protected sub?: redis.RedisClientType;
  protected get prefix() {
    return this.options.prefix ?? "";
  }

  protected async connect() {
    const opt: MicroRedisClientOptions = { ...this.options };
    if (!("url" in opt)) {
      opt.url = `redis://localhost:6379`;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const redisPkg = require("redis");
    const pub = redisPkg.createClient(opt) as redis.RedisClientType;
    const sub = redisPkg.createClient(opt) as redis.RedisClientType;

    this.pub = pub;
    this.sub = sub;
    await Promise.all([pub.connect(), sub.connect()]);
  }

  async dispose() {
    await this.pub?.quit();
    this.pub = undefined;
    await this.sub?.quit();
    this.sub = undefined;
  }

  async send<T = any>(
    pattern: string,
    data: any,
    timeout?: number
  ): Promise<T> {
    if (!this.sub?.isReady || !this.pub?.isReady) {
      throw new Error("The connection is not connected");
    }

    pattern = this.prefix + pattern;
    const packet = super.createServerPacket(pattern, data, true);
    const reply = pattern + "." + packet.id;

    const sub = this.sub as Exclude<typeof this.pub, undefined>;
    return new Promise(async (resolve, reject) => {
      let timeoutInstance: NodeJS.Timeout | undefined;
      const sendTimeout = timeout ?? this.options.sendTimeout ?? 10000;
      if (sendTimeout != 0) {
        timeoutInstance = setTimeout(() => {
          sub.unsubscribe(reply);
          reject(new Error("Send timeout"));
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

          const packet: ClientPacket = parseJsonBuffer(buffer);
          if (packet.error) {
            reject(new Error(packet.error));
          } else {
            resolve(packet.data ?? packet["response"]);
          }
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
    const packet = super.createServerPacket(pattern, data, false);
    this.#sendPacket(packet);
  }

  #sendPacket(packet: any) {
    const json = JSON.stringify(packet);

    const pub = this.pub as redis.RedisClientType;
    pub.publish(packet.pattern, json);
  }
}
