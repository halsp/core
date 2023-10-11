import type redis from "redis";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MicroRedisOptions<
  M extends redis.RedisModules = redis.RedisModules,
  F extends redis.RedisFunctions = redis.RedisFunctions,
  S extends redis.RedisScripts = redis.RedisScripts,
> extends redis.RedisClientOptions<M, F, S> {}

export interface MicroRedisClientOptions<
  M extends redis.RedisModules = redis.RedisModules,
  F extends redis.RedisFunctions = redis.RedisFunctions,
  S extends redis.RedisScripts = redis.RedisScripts,
> extends redis.RedisClientOptions<M, F, S> {
  prefix?: string;
  sendTimeout?: number;
}
