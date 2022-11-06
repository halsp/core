import * as redis from "redis";

export interface MicroRedisOptions<
  M extends redis.RedisModules = redis.RedisModules,
  F extends redis.RedisFunctions = redis.RedisFunctions,
  S extends redis.RedisScripts = redis.RedisScripts
> extends Omit<redis.RedisClientOptions<M, F, S>, "url"> {
  host?: string;
  port?: number;
  retryAttempts?: number;
  retryDelay?: number;
  prefix?: string;
}

export interface MicroRedisClientOptions<
  M extends redis.RedisModules = redis.RedisModules,
  F extends redis.RedisFunctions = redis.RedisFunctions,
  S extends redis.RedisScripts = redis.RedisScripts
> extends Omit<redis.RedisClientOptions<M, F, S>, "url"> {
  host?: string;
  port?: number;
  prefix?: string;
}
