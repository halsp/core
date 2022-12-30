import { parseJsonBuffer } from "@ipare/micro-common";
import * as redis from "redis";
import { IMicroClient } from "@ipare/micro-client";
import { MicroRedisClientOptions } from "./options";

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
    async function disconnect(redis?: redis.RedisClientType) {
      if (redis?.isReady && redis.isOpen) {
        await redis.quit();
      }
    }
    await disconnect(this.pub);
    this.pub = undefined;
    await disconnect(this.sub);
    this.sub = undefined;
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
    const packet = super.createServerPacket(pattern, data, true);
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

          const packet = parseJsonBuffer(buffer);
          resolve({
            data: packet.data ?? packet.response,
            error: packet.error,
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
    const packet = super.createServerPacket(pattern, data, false);
    this.#sendPacket(packet);
  }

  #sendPacket(packet: any) {
    const json = JSON.stringify(packet);

    const pub = this.pub as redis.RedisClientType;
    pub.publish(packet.pattern, json);
  }
}
