import { Inject } from "@halsp/inject";
import { OPTIONS_IDENTITY } from "./constant";
import * as redis from "redis";

export const Redis = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Redis extends redis.RedisClientType {}
