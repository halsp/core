import * as redis from "redis";
import { MicroRedisClientOptions, MicroRedisOptions } from "./options";

export async function closeClients(
  pub?: redis.RedisClientType<any, any, any>,
  sub?: redis.RedisClientType<any, any, any>
) {
  if (pub?.isReady) {
    await pub.disconnect();
  }
  if (sub?.isReady) {
    await sub.disconnect();
  }
}

export function createClients(
  options: MicroRedisOptions | MicroRedisClientOptions
) {
  const host = options.host ?? "localhost";
  const port = options.port ?? 6379;
  const opt: any = { ...options };
  delete opt.host;
  delete opt.port;
  opt.url = `redis://${host}:${port}`;

  const pub = redis.createClient(opt) as redis.RedisClientType<any, any, any>;
  const sub = redis.createClient(opt) as redis.RedisClientType<any, any, any>;
  return { pub, sub };
}
