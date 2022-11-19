import type redis from "redis";

export interface MicroRedisOptions<
  M extends redis.RedisModules = redis.RedisModules,
  F extends redis.RedisFunctions = redis.RedisFunctions,
  S extends redis.RedisScripts = redis.RedisScripts
> extends Omit<redis.RedisClientOptions<M, F, S>, "url"> {
  host?: string;
  port?: number;
}
