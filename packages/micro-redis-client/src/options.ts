import * as redis from "redis";

export interface MicroRedisClientOptions<
  M extends redis.RedisModules = redis.RedisModules,
  F extends redis.RedisFunctions = redis.RedisFunctions,
  S extends redis.RedisScripts = redis.RedisScripts
> extends redis.RedisClientOptions<M, F, S> {
  prefix?: string;
  sendTimeout?: number;
}
