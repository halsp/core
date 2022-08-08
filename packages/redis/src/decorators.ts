import { Inject } from "@ipare/inject";
import { OPTIONS_IDENTITY } from "./constant";

export const RedisClient = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));
