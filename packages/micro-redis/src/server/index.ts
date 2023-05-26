import "./startup";
import * as redis from "redis";
import { MicroRedisOptions } from "../options";
import { Context } from "@halsp/core";

declare module "@halsp/core" {
  interface Startup {
    useMicroRedis(options?: MicroRedisOptions): this;

    listen(): Promise<{
      pub: redis.RedisClientType;
      sub: redis.RedisClientType;
    }>;
    close(): Promise<void>;

    register(
      pattern: string,
      handler?: (ctx: Context) => Promise<void> | void
    ): this;
  }
}
