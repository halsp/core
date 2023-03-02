import { Inject } from "@halsp/inject";
import { OPTIONS_IDENTITY } from "./constant";

export const RedisInject = (identity?: string) =>
  Inject(OPTIONS_IDENTITY + (identity ?? ""));
