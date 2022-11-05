import * as redis from "redis";
import { REDIS_DEFAULT_CHANNEL } from "../constant";
import { MicroRedisClientOptions, MicroRedisOptions } from "./options";

export abstract class RedisConnection {
  protected abstract pub?: redis.RedisClientType<any, any, any>;
  protected abstract sub?: redis.RedisClientType<any, any, any>;

  protected abstract get channel(): string;
  protected abstract get replyChanlel(): string;
  protected abstract closeClients(): Promise<void>;
  protected abstract initClients(): Promise<void>;
}

export async function initRedisConnection(
  this: RedisConnection,
  options: MicroRedisOptions | MicroRedisClientOptions
) {
  Object.defineProperty(this, "channel", {
    get: () => options.channel ?? REDIS_DEFAULT_CHANNEL,
  });
  Object.defineProperty(this, "replyChanlel", {
    get: function () {
      return this.channel + ".reply";
    },
  });

  this.closeClients = async function () {
    if ((this as any).pub?.isReady) {
      await (this as any).pub.disconnect();
    }
    (this as any).pub = undefined;
    if ((this as any).sub?.isReady) {
      await (this as any).sub.disconnect();
    }
    (this as any).sub = undefined;
  };

  this.initClients = async function () {
    const host = options.host ?? "localhost";
    const port = options.port ?? 6379;
    const opt: any = { ...options };
    delete opt.host;
    delete opt.port;
    opt.url = `redis://${host}:${port}`;

    const pub = redis.createClient(opt) as redis.RedisClientType<any, any, any>;
    const sub = redis.createClient(opt) as redis.RedisClientType<any, any, any>;

    (this as any).pub = pub;
    (this as any).sub = sub;
    await Promise.all([pub.connect(), sub.connect()]);
  };
}
