import * as redis from "redis";
import { MicroRedisClientOptions, MicroRedisOptions } from "./options";

export abstract class RedisConnection {
  protected abstract pub?: redis.RedisClientType<any, any, any>;
  protected abstract sub?: redis.RedisClientType<any, any, any>;

  protected abstract closeClients(): Promise<void>;
  protected abstract initClients(): Promise<void>;
}

export async function initRedisConnection(
  this: RedisConnection,
  options: MicroRedisOptions | MicroRedisClientOptions
) {
  this.closeClients = async function () {
    async function disconnect(redis?: redis.RedisClientType<any, any, any>) {
      if (redis?.isReady && redis.isOpen) {
        try {
          await redis.disconnect();
        } catch (err) {
          console.error(err);
        }
      }
    }
    await disconnect((this as any).pub);
    (this as any).pub = undefined;
    await disconnect((this as any).sub);
    (this as any).sub = undefined;
  };

  this.initClients = async function () {
    await (this as any).closeClients();

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
