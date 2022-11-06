import * as redis from "redis";
import { MicroRedisClientOptions, MicroRedisOptions } from "./options";

export abstract class RedisConnection<
  T extends MicroRedisOptions | MicroRedisClientOptions =
    | MicroRedisOptions
    | MicroRedisClientOptions
> {
  protected readonly reply!: string;
  protected readonly prefix!: string;
  protected readonly options!: T;

  protected pub?: redis.RedisClientType<any, any, any>;
  protected sub?: redis.RedisClientType<any, any, any>;

  protected async closeClients(): Promise<void> {
    async function disconnect(redis?: redis.RedisClientType<any, any, any>) {
      if (redis?.isReady && redis.isOpen) {
        await redis.disconnect();
      }
    }
    await disconnect(this.pub);
    this.pub = undefined;
    await disconnect(this.sub);
    this.sub = undefined;
  }

  protected async initClients(): Promise<void> {
    await (this as any).closeClients();

    const host = this.options.host ?? "localhost";
    const port = this.options.port ?? 6379;
    const opt: any = { ...this.options };
    delete opt.host;
    delete opt.port;
    opt.url = `redis://${host}:${port}`;

    const pub = redis.createClient(opt) as redis.RedisClientType<any, any, any>;
    const sub = redis.createClient(opt) as redis.RedisClientType<any, any, any>;

    this.pub = pub;
    this.sub = sub;
    await Promise.all([pub.connect(), sub.connect()]);
  }
}

export async function initRedisConnection<
  T extends MicroRedisOptions | MicroRedisClientOptions =
    | MicroRedisOptions
    | MicroRedisClientOptions
>(this: RedisConnection<T>) {
  this.closeClients = RedisConnection.prototype.closeClients.bind(this);
  this.initClients = RedisConnection.prototype.initClients.bind(this);
  Object.defineProperty(this, "prefix", {
    configurable: true,
    enumerable: true,
    get: () => this.options.prefix ?? "",
  });
  Object.defineProperty(this, "reply", {
    configurable: true,
    enumerable: true,
    get: () => ".reply",
  });
}
