import "./startup";
import * as redis from "redis";
import { MicroRedisOptions } from "../options";
import "@halsp/micro/server";

declare module "@halsp/core" {
  interface Startup {
    useMicroRedis(options?: MicroRedisOptions): this;

    listen(): Promise<{
      pub: redis.RedisClientType;
      sub: redis.RedisClientType;
    }>;
    close(): Promise<void>;
  }
}
