import { InjectType } from "@ipare/inject";
import redis from "redis";

export type Options<
  M extends redis.RedisModules = redis.RedisModules,
  F extends redis.RedisFunctions = redis.RedisFunctions,
  S extends redis.RedisScripts = redis.RedisScripts
> = redis.RedisClientOptions<M, F, S> & {
  injectType?: InjectType;
  identity?: string;
};
